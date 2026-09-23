import { Router } from "express";
import { prisma } from "../lib/prisma";

export const accessRouter = Router();

// Esta validación siempre ocurre en backend — nunca se confía en el estado
// del frontend para conceder acceso (regla de CLAUDE.md).
accessRouter.post("/validate", async (req, res, next) => {
  try {
    const { userId, scannedBy } = req.body as {
      userId?: string;
      scannedBy?: string;
    };

    if (!userId) {
      return res.status(400).json({
        error: "USER_ID_REQUERIDO",
        message: "Falta el identificador del usuario.",
      });
    }
    // TODO(seguridad): scannedBy viene del body como stopgap temporal mientras
    // no existe sesión de admin autenticada. Es falsificable por el cliente —
    // no sirve como auditoría real hasta que se reemplace por
    // req.session.user.id (o equivalente) cuando exista login de admin. No
    // confiar en este campo para auditoría hasta ese cambio.

    if (!scannedBy) {
      return res.status(400).json({
        error: "SCANNED_BY_REQUERIDO",
        message: "Falta identificar al administrador que escaneó el código.",
      });
    }

    const now = new Date();
     // No basta con status: "active, si el job programado que marca
    // membresías vencidas todavía no corrió ese día, endDate ya
    // pudo haber pasado aunque el status en la DB siga desactualizado.
    // Se valida la fecha real, no solo la etiqueta.



    const activeMembership = await prisma.membership.findFirst({
      where: { userId, status: "active", endDate: { gte: now } },
    });

    if (!activeMembership) {
      await prisma.accessLog.create({
        data: { userId, type: "entry", result: "denied_expired", scannedBy },
      });
      return res.json({
        granted: false,
        result: "denied_expired",
        message: "Tu membresía venció. Renuévala para entrar.",
      });
    }


    // QR duplicado: Si la última, entrada concedida de este usuario no tiene una salida registrada
    // después, significa que ya está adentro (o alguien más entró con su
    // QR compartido). Se rechaza el segundo ingreso y queda marcado como
    // intento sospechoso, visible para el admin.
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
          data: { userId, type: "entry", result: "denied_duplicate", scannedBy },
        });
        return res.json({
          granted: false,
          result: "denied_duplicate",
          message: "Este código ya registró entrada. Contacta a recepción.",
        });
      }
    }

    // Acceso concedido: se registra en AccessLog, que es la fuente única
    // de verdad para el aforo en tiempo real, no se mantiene un contador
    // separado que pueda desincronizarse (por ejemplo, si se borra un log por error).

    await prisma.accessLog.create({
      data: { userId, type: "entry", result: "granted", scannedBy },
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
