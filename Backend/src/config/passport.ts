// src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ?? "/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("ERROR: faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env");
  console.error("Define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET antes de iniciar el servidor.");
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Extra logging útil en desarrollo (quita o reduce en producción)
          console.log("Google profile received:", {
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails?.map((e: any) => e.value),
          });

          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          if (!email) {
            const err = new Error("No email returned from Google");
            console.error(err);
            return done(err, null);
          }

          // Buscar usuario por email
          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            // Crear nuevo usuario: incluir todos los campos obligatorios de tu schema
            user = await prisma.user.create({
              data: {
                name: profile.displayName ?? "Sin nombre",
                email,
                googleId: profile.id,
                role: "member", // ajusta si necesitas otro default
                qrCode: `${profile.id}-${Date.now()}`, // valor simple; cámbialo si tienes lógica específica
                // Si tu modelo requiere otros campos obligatorios, agrégalos aquí
              },
            });
            console.log("Usuario creado desde Google OAuth:", user.id);
          } else if (!user.googleId) {
            // Vincular cuenta existente por email
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id },
            });
            console.log("Usuario existente vinculado con googleId:", user.id);
          } else {
            // Usuario ya existe y está vinculado
            console.log("Usuario encontrado y ya vinculado:", user.id);
          }

          return done(null, user);
        } catch (err: any) {
          // Loguea errores de Prisma u otros para facilitar debugging
          console.error("Error en GoogleStrategy callback:", err);
          return done(err, null);
        }
      }
    )
  );
}

// Serialización / deserialización para sesiones
passport.serializeUser((user: any, done) => {
  try {
    done(null, user.id);
  } catch (err) {
    done(err as Error, null);
  }
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user ?? null);
  } catch (err) {
    console.error("Error deserializing user:", err);
    done(err as Error, null);
  }
});

export default passport;
