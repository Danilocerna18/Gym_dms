import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: No se encontró DATABASE_URL en el archivo .env");
  process.exit(1);
}

const pgPool = new Pool({
  connectionString,
  ssl: connectionString.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
});

pgPool
  .query("SELECT 1")
  .then(() => {
    console.log("Session store: Postgres pool OK");
  })
  .catch((err) => {
    console.error(
      "Session store: error conectando a Postgres:",
      err.message
    );
  });

const PgSession = connectPgSimple(session);

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    createTableIfMissing: true,
  }),

  secret: process.env.SESSION_SECRET!,

  resave: false,

  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: EIGHT_HOURS_MS,
  },

  name: process.env.SESSION_COOKIE_NAME ?? "gysess",
});

export { pgPool };