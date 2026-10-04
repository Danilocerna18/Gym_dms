import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ??
  "http://localhost:3000/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "ERROR: Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env"
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google profile recibido:", {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value,
          });

          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("Google no devolvió un email"), undefined);
          }

          let user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.displayName ?? "Usuario Google",
                email,
                googleId: profile.id,
                role: "member",
                qrCode: `${profile.id}-${Date.now()}`,
              },
            });

            console.log("Usuario Google creado:", user.id);
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                googleId: profile.id,
              },
            });

            console.log("Cuenta Google vinculada:", user.id);
          } else {
            console.log("Usuario Google encontrado:", user.id);
          }

          return done(null, user);
        } catch (error) {
          console.error("Error en GoogleStrategy:", error);
          return done(error as Error, undefined);
        }
      }
    )
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    done(null, user ?? false);
  } catch (error) {
    console.error("Error deserializando usuario:", error);
    done(error as Error);
  }
});

export default passport;