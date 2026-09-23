import session from "express-session";  //motor de sesiones para Express
import connectPgSimple from "connect-pg-simple"; //adaptador para guardar sesiones en Postgres
import { Pool } from "pg"; //maneja conexiones reusables hacia la base de datos

// Agnóstico al método de login (sesión propia o Google, todavía no está
// decidido si se elimina la autenticación propia, así que este store no
// asume ninguno de los dos.
const pgPool = new Pool({ 
  connectionString: process.env.DATABASE_URL, //usa el mismo Neon que el resto de la app
  ssl: { rejectUnauthorized: false },  //Neon exige SSL, esto evita que Node rechace su certificado
});

const PgSession = connectPgSimple(session);  //crea la versión Postgres del store de sesiones

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000; // 8 horas en milisegundos, para que maxAge sea legible

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pgPool, //reutiliza el mismo pool de conexión de arriba
    createTableIfMissing: true, //crea la tabla "session" en Neon si no existe todavía
  }),
  secret: process.env.SESSION_SECRET ?? "changeme", // firma las cookies, "changeme" es un fallback si falta en .env
  resave: false, //no reescribe la sesión en cada request si no cambió nada
  saveUninitialized: false, //no crea una sesión vacía para visitantes que no hicieron login
  cookie: {
    httpOnly: true, //JavaScript del navegador no puede leer esta cookie (protección XSS)
    secure: process.env.NODE_ENV === "production",  //solo viaja por HTTPS en producción
    maxAge: EIGHT_HOURS_MS, //la cookie expira después de 8 horas, forzando re-login
  },
});
