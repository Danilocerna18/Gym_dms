import { Router } from "express";
import { prisma } from "../lib/prisma";

export const accessRouter = Router();

// Esta validación siempre ocurre en backend — nunca se confía en el estado
// del frontend para conceder acceso (regla de CLAUDE.md).
accessRouter.post("/validate", async (req, res, next) => {
  try {
    const { userId } = req.body as { userId?: string };

    if (!userId) {
      return res.status(400).json({
        error: "USER_ID_REQUERIDO",
        message: "Falta el identificador del usuario.",
      });
    }

    const now = new Date();

    // TODO: cuando exista sesión de admin autenticada en este flujo, pasar su
    // id como `scannedBy` en los AccessLog de abajo — data_model.md sección 5
    // lo marca como obligatorio para type entry/exit. Pendiente de definir
    // con el resto del equipo antes de forzarlo.

    const activeMembership = await prisma.membership.findFirst({
      where: { userId, status: "active", endDate: { gte: now } },
    });

    if (!activeMembership) {
      await prisma.accessLog.create({
        data: { userId, type: "entry", result: "denied_expired" },
      });
      return res.json({
        granted: false,
        result: "denied_expired",
        message: "Tu membresía venció. Renuévala para entrar.",
      });
    }

    const lastGrantedEntry = await prisma.accessLog.findFirst({
      where: { userId, type: "entry", result: "granted" },
      orderBy: { createdAt: "desc" },
    });

    if (lastGrantedEntry) {
      const exitAfterEntry = await prisma.accessLog.findFirst({
        where: {
          userId,
          type: "exit",
          createdAt: { gt: lastGrantedEntry.createdAt },
        },
      });

      if (!exitAfterEntry) {
        await prisma.accessLog.create({
          data: { userId, type: "entry", result: "denied_duplicate" },
        });
        return res.json({
          granted: false,
          result: "denied_duplicate",
          message: "Este código ya registró entrada. Contacta a recepción.",
        });
      }
    }

    await prisma.accessLog.create({
      data: { userId, type: "entry", result: "granted" },
    });
    return res.json({
      granted: true,
      result: "granted",
      message: "Acceso concedido",
    });
  } catch (err) {
    next(err);
  }
});
