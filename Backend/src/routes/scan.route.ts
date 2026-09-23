import { Router } from "express";
import { prisma } from "../lib/prisma";

export const scanRouter = Router();

scanRouter.post("/", async (req, res, next) => {
  try {
    const { qrCode } = req.body as { qrCode?: string };

    if (!qrCode) {
      return res.status(400).json({
        error: "QR_REQUERIDO",
        message: "Falta el código QR.",
      });
    }

    const user = await prisma.user.findUnique({ where: { qrCode } });
    if (user) {
      return res.json({ type: "membership", userId: user.id });
    }

    const machine = await prisma.machine.findUnique({ where: { qrCode } });
    if (machine) {
      return res.json({ type: "machine", machineId: machine.id });
    }

    return res.status(404).json({
      error: "QR_NO_RECONOCIDO",
      message: "Código QR no reconocido.",
    });
  } catch (err) {
    next(err);
  }
});
