import { ErrorRequestHandler } from "express";

// Nunca exponer el error real al cliente: solo un mensaje genérico en español.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "ERROR_INTERNO",
    message: "Algo salió mal. Intenta de nuevo.",
  });
};
