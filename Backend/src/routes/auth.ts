// src/routes/auth.ts
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";

const router = express.Router();

// Inicia flujo OAuth con Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback de Google con manejo explícito de errores para debug y producción
router.get("/google/callback", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", (err: any, user: any, info: any) => {
    if (err) {
      console.error("Passport authenticate error:", err);
      return res.status(500).json({
        error: "ERROR_INTERNO",
        message: err.message ?? "Algo salió mal. Intenta de nuevo.",
      });
    }

    if (!user) {
      console.warn("Passport authenticate no user, info:", info);
      // Si no hay usuario, redirigimos al frontend (puedes ajustar a una ruta de error)
      return res.redirect(process.env.FRONTEND_URL ?? "/");
    }

    req.logIn(user, (loginErr: any) => {
      if (loginErr) {
        console.error("req.logIn error:", loginErr);
        return res.status(500).json({
          error: "ERROR_INTERNO",
          message: loginErr.message ?? "Error iniciando sesión.",
        });
      }

      // Éxito: redirige al frontend
      return res.redirect(process.env.FRONTEND_URL ?? "http://localhost:4200");
    });
  })(req, res, next);
});

// Endpoint para obtener usuario logueado
router.get("/me", (req: Request, res: Response) => {
  // req.isAuthenticated es añadido por passport en runtime
  // @ts-ignore
  if (req.isAuthenticated && req.isAuthenticated()) {
    // @ts-ignore
    return res.json({ user: req.user });
  }
  return res.status(401).json({ user: null });
});

// Logout (opcional pero útil)
router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    // destruye la sesión y redirige al frontend
    req.session?.destroy((destroyErr) => {
      if (destroyErr) console.error("Session destroy error:", destroyErr);
      res.clearCookie(process.env.SESSION_COOKIE_NAME ?? "gysess");
      return res.json({ ok: true });
    });
  });
});

export default router;
