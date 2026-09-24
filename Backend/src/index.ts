// justo después de import "dotenv/config";
console.log("ENV CHECK: DATABASE_URL", !!process.env.DATABASE_URL);
console.log("ENV CHECK: GOOGLE_CLIENT_ID", !!process.env.GOOGLE_CLIENT_ID);
console.log("ENV CHECK: GOOGLE_CLIENT_SECRET", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("ENV CHECK: SESSION_SECRET", !!process.env.SESSION_SECRET);

// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";

import { sessionMiddleware } from "./config/session";
import { authRateLimit, scanRateLimit } from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { scanRouter } from "./routes/scan.route";
import { accessRouter } from "./routes/access.route";
import { webhooksRouter } from "./routes/webhooks.route";

import "./config/passport"; // inicializa passport (usa las vars de entorno)
import authRouter from "./routes/auth";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:4200",
    credentials: true,
  })
);

app.use(express.json());
app.use(sessionMiddleware);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limits
app.use("/api/auth", authRateLimit);
app.use("/api/scan", scanRateLimit);

// Rutas existentes
app.use("/api/scan", scanRouter);
app.use("/api/access", accessRouter);
app.use("/api/webhooks", webhooksRouter);

// Rutas de auth (Google)
app.use("/api/auth", authRouter);

// Rutas de usuario (Perfil, QR y Máquinas)
app.use("/api", userRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GymSync backend corriendo en el puerto ${PORT}`);
});