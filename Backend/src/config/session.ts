import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool, PoolConfig } from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: No se encontró DATABASE_URL en el archivo .env");
  process.exit(1);
}

// Bundle público de CAs de AWS RDS. La ruta sirve igual desde src/config y dist/config.
const RDS_CA_PATH = path.resolve(__dirname, "../../certs/global-bundle.pem");

// Parámetros SSL que pg lee de la URL. Si están presentes, pg los usa y
// sobrescribe la opción `ssl` de la Pool, así que se quitan cuando pasamos `ssl` explícito.
const URL_SSL_PARAMS = ["sslmode", "sslrootcert", "sslcert", "sslkey", "uselibpqcompat"];

function buildPoolConfig(url: string): PoolConfig {
  const parsed = new URL(url);
  const isRds = parsed.hostname.endsWith(".rds.amazonaws.com");

  if (!isRds) {
    // Base local u otro proveedor: pg aplica lo que diga la URL
    // (sin sslmode = sin SSL; sslmode=require = SSL verificado con las CAs del sistema).
    return { connectionString: url };
  }

  if (!fs.existsSync(RDS_CA_PATH)) {
    console.error(`ERROR: DATABASE_URL apunta a RDS pero no existe ${RDS_CA_PATH}`);
    process.exit(1);
  }

  URL_SSL_PARAMS.forEach((param) => parsed.searchParams.delete(param));

  return {
    connectionString: parsed.toString(),
    ssl: {
      ca: fs.readFileSync(RDS_CA_PATH, "utf8"),
      rejectUnauthorized: true,
    },
  };
}

const pgPool = new Pool(buildPoolConfig(connectionString));

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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EIGHT_HOURS_MS,
  },

  name: process.env.SESSION_COOKIE_NAME ?? "gysess",
});

export { pgPool };