import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

export const authRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "DEMASIADOS_INTENTOS",
    message: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  },
});

export const scanRateLimit = rateLimit({
  windowMs: ONE_MINUTE_MS,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "DEMASIADOS_ESCANEOS",
    message: "Demasiados escaneos seguidos. Espera un momento e intenta de nuevo.",
  },
});
