import express, {
  Request,
  Response,
  NextFunction,
} from "express";

import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

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
            message:
              err.message ?? "Error durante la autenticación con Google.",
          });
        }

        if (!user) {
          console.error(
            "Google no devolvió usuario:",
            info
          );

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

          console.log(
            "Login Google exitoso. Usuario:",
            user.id
          );

          return res.redirect(
            process.env.FRONTEND_URL ??
              "http://localhost:4200"
          );
        });
      }
    )(req, res, next);
  }
);

router.get("/me", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.json({
      user: req.user,
    });
  }

  return res.status(401).json({
    user: null,
  });
});

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
          console.error(
            "Session destroy error:",
            destroyErr
          );

          return res.status(500).json({
            error: "ERROR_SESION",
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