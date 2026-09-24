import express from "express";
import passport from "passport";

const router = express.Router();

// GET /api/auth/google — inicia el flujo OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// GET /api/auth/google/callback — recibe callback de Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL ?? "http://localhost:4200");
  }
);

export default router;
