import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

// Agnóstico al método de login (sesión propia o Google) — todavía no está
// decidido si se elimina la autenticación propia, así que este store no
// asume ninguno de los dos.
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PgSession = connectPgSimple(session);

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET ?? "changeme",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: EIGHT_HOURS_MS,
  },
});
