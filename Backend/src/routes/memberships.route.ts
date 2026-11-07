import { Router } from "express";
import { prisma } from "../lib/prisma";
import { crearMembresiaPendiente } from "../services/membership.service";

// Rutas del miembro sobre su propia membresía. El usuario sale siempre de la
// sesión (req.user), nunca del body, para que nadie escoja plan por otro.
export const membershipsRouter = Router();

membershipsRouter.get("/me", async (req, res, next) => {
  try {
    const membresia = await prisma.membership.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        plan: { select: { name: true, price: true } },
      },
    });

    // Sin membresía no es un error: es el estado normal de quien entró con
    // Google y todavía no escoge plan.
    if (!membresia) return res.json({ membership: null });

    return res.json({
      membership: {
        ...membresia,
        plan: { ...membresia.plan, price: Number(membresia.plan.price) },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Historial de membresías del miembro, de la más reciente a la más antigua.
// Reemplaza al historial de pagos: en el MVP el pago es en recepción y no se
// registra en Payment (PRD decisiones 11 y 12). No expone activatedById.
membershipsRouter.get("/me/history", async (req, res, next) => {
  try {
    const membresias = await prisma.membership.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        activatedAt: true,
        startDate: true,
        endDate: true,
        plan: { select: { name: true, price: true } },
      },
    });

    const ahora = new Date();
    return res.json({
      memberships: membresias.map((m) => ({
        ...m,
        // Todavía no existe el cron de vencimiento: una "active" cuya endDate
        // ya pasó se reporta como vencida, que es su estado real.
        status: m.status === "active" && m.endDate && m.endDate < ahora ? "expired" : m.status,
        plan: { ...m.plan, price: Number(m.plan.price) },
      })),
    });
  } catch (err) {
    next(err);
  }
});

membershipsRouter.post("/", async (req, res, next) => {
  try {
    const { planId } = (req.body ?? {}) as { planId?: unknown };
    if (typeof planId !== "string" || !planId) {
      return res.status(400).json({
        error: "PLAN_REQUERIDO",
        message: "Escoge un plan.",
      });
    }

    const userId = req.user!.id;
    const resultado = await prisma.$transaction((tx) =>
      crearMembresiaPendiente(tx, userId, planId)
    );

    if (!resultado.ok) {
      return res.status(resultado.status).json({
        error: resultado.error,
        message: resultado.message,
      });
    }

    return res.status(201).json({
      membership: resultado.membership,
      message: "Plan escogido. Pasa a recepción para pagar y activarlo.",
    });
  } catch (err) {
    next(err);
  }
});
