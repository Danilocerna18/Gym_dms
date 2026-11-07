import { Router } from "express";
import { calcularAforo } from "../services/aforo.service";

export const aforoRouter = Router();

// Lo ven miembros y admins: responde solo números, nunca quién está adentro.
aforoRouter.get("/", async (_req, res, next) => {
  try {
    const { personasAdentro, capacidad, porcentaje, estado } = await calcularAforo();
    return res.json({ personasAdentro, capacidad, porcentaje, estado });
  } catch (err) {
    next(err);
  }
});
