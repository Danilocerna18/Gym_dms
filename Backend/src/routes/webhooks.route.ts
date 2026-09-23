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

    // Rechaza si falta cualquiera de los dos, sin secreto configurado no
    // hay forma de verificar nada, y sin firma en el header el request no
    // viene realmente de Recurrente (o vino mal formado)

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
       // Regla de negocio: el vencimiento se recalcula desde
      // hoy, no desde el endDate anterior, evita que un pago tardío
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
