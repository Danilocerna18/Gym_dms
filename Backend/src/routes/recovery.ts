import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../config/prisma";
import { generarPasswordHash } from "../lib/password";

export const recoveryRouter = Router();
const ttl = 15 * 60_000;
const invalid = { message: "El enlace expiró, ya se utilizó o es inválido." };
const paths = ["/forgot-password", "/reset-password/validate", "/reset-password"];
recoveryRouter.use(paths, rateLimit({
  windowMs: ttl, limit: 20,
  message: { message: "Demasiados intentos. Intenta más tarde." },
}));

function digest(token: unknown) {
  return typeof token === "string" && /^[0-9a-f]{64}$/.test(token)
    ? createHash("sha256").update(token).digest("hex") : null;
}

async function deliver(email: string) {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, passwordHash: { not: null } },
    select: { id: true, email: true },
  });
  if (!user) return;
  const token = randomBytes(32).toString("hex");
  const tokenHash = digest(token)!;
  const expiresAt = new Date(Date.now() + ttl);
  // Un solo enlace por cuenta y como máximo un envío por minuto.
  const inserted = await prisma.$executeRaw`
    INSERT INTO "PasswordReset" ("userId", "tokenHash", "expiresAt")
    VALUES (${user.id}, ${tokenHash}, ${expiresAt.toISOString()}::timestamp)
    ON CONFLICT ("userId") DO UPDATE SET "tokenHash" = EXCLUDED."tokenHash", "expiresAt" = EXCLUDED."expiresAt"
    WHERE "PasswordReset"."expiresAt" <= ${new Date(expiresAt.getTime() - 60_000).toISOString()}::timestamp`;
  if (!inserted) return;
  try {
    const link = new URL("/restablecer-contrasena", process.env.FRONTEND_URL ?? "http://localhost:4200");
    link.hash = token; // El fragmento no viaja al servidor web ni en Referer.
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(10000),
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESET_MAIL_FROM, to: [user.email],
        subject: "Restablece tu contraseña de GymSync",
        text: "Abre este enlace en los próximos 15 minutos para cambiar tu contraseña:\n" + link.href +
          "\nSi no solicitaste este cambio, puedes ignorar este correo." }),
    });
    if (!result.ok) throw new Error("Entrega rechazada");
  } catch {
    await prisma.passwordReset.deleteMany({ where: { tokenHash } });
    throw new Error("Error de entrega");
  }
}

recoveryRouter.post("/forgot-password", (req, res) => {
  const email = req.body?.email;
  if (typeof email !== "string" || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return res.status(400).json({ message: "Ingresa un correo válido." });
  if (!process.env.RESEND_API_KEY || !process.env.RESET_MAIL_FROM)
    return res.status(503).json({ message: "La recuperación por correo aún no está disponible." });
  void deliver(email.trim().toLowerCase()).catch(() => console.error("GymSync: fallo al procesar el correo de recuperación."));
  res.status(202).json({ message: "Si tienes una cuenta con contraseña, recibirás un enlace de recuperación." });
});

recoveryRouter.post("/reset-password/validate", async (req, res) => {
  try {
    const tokenHash = digest(req.body?.token);
    if (!tokenHash || !await prisma.passwordReset.count({ where: { tokenHash, expiresAt: { gt: new Date() } } }))
      return res.status(400).json(invalid);
    res.json({ ok: true });
  } catch { res.sendStatus(503); }
});

recoveryRouter.post("/reset-password", async (req, res) => {
  const tokenHash = digest(req.body?.token);
  const password = req.body?.password;
  if (!tokenHash) return res.status(400).json(invalid);
  if (typeof password !== "string" || password.length < 8 || password.length > 128)
    return res.status(422).json({ message: "Utiliza entre 8 y 128 caracteres." });
  try {
    const record = await prisma.passwordReset.findUnique({ where: { tokenHash } });
    if (!record || record.expiresAt <= new Date()) return res.status(400).json(invalid);
    const passwordHash = await generarPasswordHash(password);
    const changed = await prisma.$transaction(async tx => {
      const used = await tx.passwordReset.deleteMany({ where: { tokenHash, expiresAt: { gt: new Date() } } });
      if (!used.count) return false;
      await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
      await tx.$executeRaw`DELETE FROM "session" WHERE sess->'passport'->>'user' = ${record.userId}`;
      return true;
    });
    if (!changed) return res.status(400).json(invalid);
    res.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  } catch { res.sendStatus(503); }
});
