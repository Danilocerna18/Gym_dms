import { Router } from "express";
import { prisma } from "../lib/prisma";

export const scanRouter = Router();

scanRouter.post("/", async (req, res, next) => {
  try {
    const { qrCode } = req.body as { qrCode?: string };

    if (!qrCode) {
      return res.status(400).json({
        error: "QR_REQUERIDO",
        message: "Falta el código escaneado.",
      });
    }

    const cleanCode = qrCode.trim();

    // 1. Buscar en User por qrCode o id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { qrCode: cleanCode },
          { id: cleanCode }
        ]
      }
    });

    if (user) {
      return res.json({ type: "membership", userId: user.id });
    }

    // 2. Buscar en Machine por qrCode o id
    const machine = await prisma.machine.findFirst({
      where: {
        OR: [
          { qrCode: cleanCode },
          { id: cleanCode }
        ]
      }
    });

    if (machine) {
      return res.json({ type: "machine", machineId: machine.id });
    }

    return res.status(404).json({
      error: "QR_NO_RECONOCIDO",
      message: "Este código no está registrado.",
    });
  } catch (err) {
    next(err);
  }
});