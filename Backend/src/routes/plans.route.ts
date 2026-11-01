import { Router } from "express";
import { prisma } from "../lib/prisma";

export const plansRouter = Router();

// Catálogo público: lo usa la pantalla de registro antes de que exista una
// sesión. Solo planes activos; los desactivados se conservan por el histórico.
plansRouter.get("/", async (_req, res, next) => {
  try {
    const planes = await prisma.membershipPlan.findMany({
      where: { active: true },
      orderBy: { durationDays: "asc" },
      select: { id: true, name: true, durationDays: true, price: true },
    });

    // price es Decimal en Prisma y se serializaría como texto; se manda como
    // número para que el frontend lo muestre sin convertirlo.
    return res.json({
      plans: planes.map((plan) => ({ ...plan, price: Number(plan.price) })),
    });
  } catch (err) {
    next(err);
  }
});
