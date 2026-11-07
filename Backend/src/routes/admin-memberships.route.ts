import { Router } from "express";
import { prisma } from "../lib/prisma";
import { activarMembresia } from "../services/membership.service";

export const adminMembershipsRouter = Router();

// El admin activa la membresía cuando el miembro paga en recepción. El admin
// que activa sale de la sesión, no del body, para que la auditoría sea real.
adminMembershipsRouter.patch("/:id/activate", async (req, res, next) => {
  try {
    const membershipId = req.params.id;
    const adminId = req.user!.id;

    const resultado = await prisma.$transaction((tx) =>
      activarMembresia(tx, membershipId, adminId)
    );

    if (!resultado.ok) {
      return res.status(resultado.status).json({
        error: resultado.error,
        message: resultado.message,
      });
    }

    return res.json({
      membership: resultado.membership,
      message: "Membresía activada",
    });
  } catch (err) {
    next(err);
  }
});
