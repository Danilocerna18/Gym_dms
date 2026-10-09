
import express, {
  Request,
  Response,
  NextFunction,
} from "express";

import passport from "passport";
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
} from "node:crypto";

import { prisma } from "../config/prisma";

const router = express.Router();

// Cifrar la contraseña utilizando scrypt.
// La contraseña original nunca se guarda en la base de datos.
function generarPasswordHash(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, 64, (error, resultado) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`scrypt$${salt}$${resultado.toString("hex")}`);
    });
  });
}

// Permite identificar errores de restricciones únicas de Prisma.
function obtenerCodigoError(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return (error as { code?: string }).code;
  }

  return undefined;
}

// REGISTRO CON CORREO Y CONTRASEÑA
router.post(
  "/register",
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};

    // 1. Validar que los datos sean cadenas de texto.
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "DATOS_INVALIDOS",
        message: "Debes completar todos los campos.",
      });
    }

    const nombre = name.trim();
    const correo = email.trim().toLowerCase();

    // 2. Validar nombre.
    if (nombre.length < 2 || nombre.length > 100) {
      return res.status(400).json({
        error: "NOMBRE_INVALIDO",
        message: "El nombre debe tener entre 2 y 100 caracteres.",
      });
    }

    // 3. Validar formato del correo.
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      correo.length > 254 ||
      !formatoEmail.test(correo)
    ) {
      return res.status(400).json({
        error: "EMAIL_INVALIDO",
        message: "Ingresa un correo electrónico válido.",
      });
    }

    // 4. Validar contraseña.
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        error: "PASSWORD_INVALIDO",
        message: "La contraseña debe tener entre 8 y 128 caracteres.",
      });
    }

    try {
      // 5. Buscar también coincidencias que solo cambien
      // mayúsculas y minúsculas.
      const usuarioExistente = await prisma.user.findFirst({
        where: {
          email: {
            equals: correo,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      if (usuarioExistente) {
        return res.status(409).json({
          error: "EMAIL_REGISTRADO",
          message: "Este correo ya está registrado. Utiliza otro correo o inicia sesión.",
        });
      }

      // 6. Cifrar la contraseña.
      const passwordHash = await generarPasswordHash(password);

      // 7. Crear al usuario en PostgreSQL mediante Prisma.
      const usuario = await prisma.user.create({
        data: {
          name: nombre,
          email: correo,
          passwordHash,
          role: "member",
          qrCode: `USER-${randomUUID()}`,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          qrCode: true,
          createdAt: true,
        },
      });

      // 8. Responder sin revelar la contraseña ni su hash.
      return res.status(201).json({
        ok: true,
        message: "Tu cuenta fue creada correctamente.",
        user: usuario,
      });
    } catch (error: unknown) {
      // Evita duplicados si dos solicitudes intentan registrar
      // el mismo correo prácticamente al mismo tiempo.
      if (obtenerCodigoError(error) === "P2002") {
        const usuarioExistente = await prisma.user.findFirst({
          where: {
            email: {
              equals: correo,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
          },
        }).catch(() => null);

        if (usuarioExistente) {
          return res.status(409).json({
            error: "EMAIL_REGISTRADO",
            message: "Este correo ya está registrado. Utiliza otro correo o inicia sesión.",
          });
        }

        return res.status(409).json({
          error: "CONFLICTO_DATOS",
          message: "No se pudo completar el registro por un conflicto de datos. Intenta nuevamente.",
        });
      }

      console.error("Error al registrar usuario:", error);

      return res.status(500).json({
        error: "ERROR_INTERNO",
        message: "No se pudo crear la cuenta. Intenta nuevamente.",
      });
    }
  }
);

// INICIAR AUTENTICACIÓN CON GOOGLE
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// RESPUESTA DE GOOGLE
router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      (err: any, user: any, info: any) => {
        if (err) {
          console.error("Passport authenticate error:", err);

          return res.status(500).json({
            error: "ERROR_INTERNO",
            message: "Error durante la autenticación con Google.",
          });
        }

        if (!user) {
          console.error("Google no devolvió usuario:", info);

          return res.status(401).json({
            error: "AUTENTICACION_FALLIDA",
            message: "No se pudo iniciar sesión con Google.",
          });
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("req.logIn error:", loginErr);

            return res.status(500).json({
              error: "ERROR_SESION",
              message: "No se pudo crear la sesión.",
            });
          }

          return res.redirect(
            process.env.FRONTEND_URL ?? "http://localhost:4200"
          );
        });
      }
    )(req, res, next);
  }
);

// CONSULTAR SESIÓN ACTUAL
router.get("/me", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const usuario = req.user as {
      id: string;
      name: string;
      email: string;
      role: string;
      qrCode: string;
      createdAt: Date;
    };

    // No devolver passwordHash ni otros datos privados.
    return res.json({
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        qrCode: usuario.qrCode,
        createdAt: usuario.createdAt,
      },
    });
  }

  return res.status(401).json({
    user: null,
  });
});

// CERRAR SESIÓN
router.post(
  "/logout",
  (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destroy error:", destroyErr);

          return res.status(500).json({
            error: "ERROR_SESION",
            message: "No se pudo cerrar la sesión.",
          });
        }

        res.clearCookie(
          process.env.SESSION_COOKIE_NAME ?? "gysess"
        );

        return res.json({
          ok: true,
        });
      });
    });
  }
);

export default router;