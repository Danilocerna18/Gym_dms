import { createHmac, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { prisma } from "../lib/prisma";

export const webhooksRouter = Router();

// IMPORTANTE: este endpoint comparte el flujo de estado de Payment/Membership
// con POST /api/payments/initiate
webhooksRouter.post("/recurrente", async (req, res, next) => {
  try {
    const secret = process.env.RECURRENTE_WEBHOOK_SECRET;
    const id = req.header("svix-id");
    const timestamp = req.header("svix-timestamp");
    const signatures = req.header("svix-signature");
    if (!secret?.startsWith("whsec_") || !id || !timestamp || !signatures ||
        !Buffer.isBuffer(req.body) || !/^\d+$/.test(timestamp) ||
        Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      return res.status(401).json({ message: "Firma de webhook inválida." });
    }
    const expected = createHmac("sha256", Buffer.from(secret.slice(6), "base64"))
      .update(id + "." + timestamp + ".").update(req.body).digest();
    const valid = signatures.split(" ").some(signature => {
      const [version, value] = signature.split(",");
      const actual = Buffer.from(value ?? "", "base64");
      return version === "v1" && actual.length === expected.length && timingSafeEqual(actual, expected);
    });
    if (!valid) return res.status(401).json({ message: "Firma de webhook inválida." });
    const payload = JSON.parse(req.body.toString("utf8"));

    const { recurrentePaymentId, status, paidAt } = payload as {
      recurrentePaymentId?: string;
      status?: "completed" | "failed";
      paidAt?: string;
    };

    if (typeof recurrentePaymentId !== "string" || !recurrentePaymentId ||
        !["completed", "failed"].includes(status ?? "") ||
        (paidAt !== undefined && (typeof paidAt !== "string" || !Number.isFinite(Date.parse(paidAt))))) {
      return res.status(400).json({ message: "Datos de pago inválidos." });
    }

     // Se trae membership + plan en la misma consulta porque los vamos a
    // necesitar más abajo para calcular endDate, evita una segunda ida a la base de datos.
    const payment = await prisma.payment.findFirst({
      where: { recurrentePaymentId },
      include: { membership: { include: { plan: true } } },
    });

    if (!payment) {
      return res.status(404).json({
        error: "PAGO_NO_ENCONTRADO",
        message: "No se encontró el pago referenciado.",
      });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
         // Prioridad: el paidAt que manda Recurrente (dato real del
        // procesador) > "ahora" si se confirmó el pago pero no vino
        // paidAt > el paidAt que ya tenía (no lo pisa si el pago falló).
        paidAt: paidAt
          ? new Date(paidAt)
          : status === "completed"
            ? new Date()
            : payment.paidAt,
      },
    });

    if (status === "completed") {
       //el vencimiento se recalcula desde hoy, no desde el endDate anterior, evita que un pago tarde
      // "sume" días sobre una membresía que ya llevaba tiempo vencida.
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + payment.membership.plan.durationDays);

      await prisma.membership.update({
        where: { id: payment.membershipId },
        data: { status: "active", endDate },
      });
    }
     // Recurrente espera una respuesta rápida, no se agrega lógica
    // adicional (como envío de correo de confirmación) directamente aquí.

    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});
