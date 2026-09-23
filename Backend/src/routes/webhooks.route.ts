import { Router } from "express";
import { prisma } from "../lib/prisma";

export const webhooksRouter = Router();

// IMPORTANTE: este endpoint comparte el flujo de estado de Payment/Membership
// con POST /api/payments/initiate (a cargo de Danilo). Coordinar con él antes
// de tocar la lógica que actualiza status/endDate aquí.
webhooksRouter.post("/recurrente", async (req, res, next) => {
  try {
    const signature = req.header("x-recurrente-signature");
    const secret = process.env.RECURRENTE_WEBHOOK_SECRET;

    if (!secret || !signature) {
      return res.status(401).json({
        error: "FIRMA_INVALIDA",
        message: "No se pudo verificar el origen del webhook.",
      });
    }

    // TODO: aún no tenemos credenciales reales de Recurrente. Cuando existan,
    // validar `signature` contra un HMAC calculado con `secret` sobre el
    // body crudo de la request, en vez de solo comprobar que ambos existan.

    const { recurrentePaymentId, status, paidAt } = req.body as {
      recurrentePaymentId?: string;
      status?: "completed" | "failed";
      paidAt?: string;
    };

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
        paidAt: paidAt
          ? new Date(paidAt)
          : status === "completed"
            ? new Date()
            : payment.paidAt,
      },
    });

    if (status === "completed") {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + payment.membership.plan.durationDays);

      await prisma.membership.update({
        where: { id: payment.membershipId },
        data: { status: "active", endDate },
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});
