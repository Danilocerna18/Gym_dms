// src/config/session.ts
import session from "express-session";  // motor de sesiones para Express
import connectPgSimple from "connect-pg-simple"; // adaptador para guardar sesiones en Postgres
import { Pool } from "pg"; // maneja conexiones reusables hacia la base de datos

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: No se encontró DATABASE_URL en el entorno. Revisa tu .env");
  // Si prefieres detener el proceso en este punto, descomenta la siguiente línea:
  // process.exit(1);
}

const pgPool = new Pool({
  connectionString: connectionString,
  // Neon exige SSL; si en tu entorno local no lo necesitas, puedes condicionar esto con una var de entorno.
  ssl: connectionString ? { rejectUnauthorized: false } : undefined,
});

// Comprobación de conexión al pool (solo para debug; es seguro dejarla)
pgPool
  .query("SELECT 1")
  .then(() => console.log("Session store: Postgres pool OK"))
  .catch((err) => console.error("Session store: error conectando a Postgres:", err.message));

const PgSession = connectPgSimple(session); // crea la versión Postgres del store de sesiones

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000; // 8 horas en milisegundos, para que maxAge sea legible

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool, // reutiliza el mismo pool de conexión de arriba
    createTableIfMissing: true, // crea la tabla "session" en Neon si no existe todavía
  }),
  secret: process.env.SESSION_SECRET ?? "changeme", // firma las cookies, "changeme" es un fallback si falta en .env
  resave: false, // no reescribe la sesión en cada request si no cambió nada
  saveUninitialized: false, // no crea una sesión vacía para visitantes que no hicieron login
  cookie: {
    httpOnly: true, // JavaScript del navegador no puede leer esta cookie (protección XSS)
    // Controla secure por variable de entorno para facilitar pruebas en local
    secure: process.env.SESSION_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    maxAge: EIGHT_HOURS_MS, // la cookie expira después de 8 horas, forzando re-login
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
  name: process.env.SESSION_COOKIE_NAME ?? "gysess",
});

// Export opcional del pool por si otros módulos (ej. pruebas o inicializadores) necesitan accederlo
export { pgPool };
