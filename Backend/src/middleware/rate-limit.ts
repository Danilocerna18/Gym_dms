import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

// Límite para /api/auth/* (previene fuerza bruta en login/registro.)
// 20 intentos cada 15 min

export const authRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 20,
  standardHeaders: true, // manda headers RateLimit-* estándar (para que el frontend pueda leer cuánto le queda)
  legacyHeaders: false, // desactiva los headers X-RateLimit-* viejos, ya no hacen falta
  message: {
    error: "DEMASIADOS_INTENTOS",
    message: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  },
});

// Límite para /api/scan — previene spam/abuso del escáner.
// Ventana corta (1 min)
// no sostenido (30/min) da margen de sobra sin permitir un bot golpeando el endpoint
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
