import { Router } from "express";
import { prisma } from "../lib/prisma";

export const scanRouter = Router();
// POST /api/scan es el pnto de entrada único del escáner de la app
// No sabe de antemano si el código es de un miembro o de una máquina
// lo resuelve consultando ambas tablas y le dice al frontend a qué flujo enrutar (validar acceso, o mostrar video de máquina)

scanRouter.post("/", async (req, res, next) => {
  try {
    const { qrCode } = req.body as { qrCode?: string };

    if (!qrCode) {
      return res.status(400).json({
        error: "QR_REQUERIDO",
        message: "Falta el código escaneado.",
      });
    }

  // Se busca primero en User: es la consulta más frecuente (todo miembro escanea su membresía mucho más seguido que una máquina).

    const user = await prisma.user.findUnique({ where: { qrCode } });
    if (user) {
      return res.json({ type: "membership", userId: user.id });
    }

    const machine = await prisma.machine.findUnique({ where: { qrCode } });
    if (machine) {
      return res.json({ type: "machine", machineId: machine.id });
    }

    // No coincide con ningún QR conocido — código inválido, no error de servidor.
    return res.status(404).json({
      error: "QR_NO_RECONOCIDO",
      message: "Este código no está registrado.",
    });
  } catch (err) {
    next(err);
  }
});
