import "dotenv/config";

console.log(
  "ENV CHECK: DATABASE_URL",
  !!process.env.DATABASE_URL
);

console.log(
  "ENV CHECK: GOOGLE_CLIENT_ID",
  !!process.env.GOOGLE_CLIENT_ID
);

console.log(
  "ENV CHECK: GOOGLE_CLIENT_SECRET",
  !!process.env.GOOGLE_CLIENT_SECRET
);

console.log(
  "ENV CHECK: SESSION_SECRET",
  !!process.env.SESSION_SECRET
);

import express from "express";
import cors from "cors";
import passport from "passport";

import { sessionMiddleware } from "./config/session";

import {
  authRateLimit,
  scanRateLimit,
} from "./middleware/rate-limit";

import { errorHandler } from "./middleware/error-handler";

import { scanRouter } from "./routes/scan.route";
import { accessRouter } from "./routes/access.route";
import { clientesRouter } from "./routes/clientes.route";
import { dashboardRouter } from "./routes/dashboard.route";
import { webhooksRouter } from "./routes/webhooks.route";
import { plansRouter } from "./routes/plans.route";
import { membershipsRouter } from "./routes/memberships.route";
import { adminMembershipsRouter } from "./routes/admin-memberships.route";

import "./config/passport";

import { requireSession } from "./middleware/authorization";
import authRouter from "./routes/auth";
import machineRoutes from "./routes/machine.routes";
import userRoutes from "./routes/user.routes";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.get("/ping", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ??
      "http://localhost:4200",

    credentials: true,
  })
);

// Verificar la firma sobre los bytes originales, antes de interpretar JSON.
app.use("/api/webhooks", express.raw({ type: "application/json" }));
app.use(express.json());

app.use(sessionMiddleware);

app.use(passport.initialize());

app.use(passport.session());

app.use(["/api/auth/login", "/api/auth/register", "/api/auth/google"], authRateLimit);
app.use("/api/auth", (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });

app.use("/api/scan", scanRateLimit);

app.use("/api/scan", requireSession("admin"), scanRouter);

app.use("/api/access", requireSession("admin"), accessRouter);

app.use("/api/clientes", requireSession("admin"), clientesRouter);

app.use("/api/dashboard", requireSession("admin"), dashboardRouter);

app.use("/api/plans", plansRouter);

app.use("/api/memberships", requireSession("member"), membershipsRouter);

app.use("/api/admin/memberships", requireSession("admin"), adminMembershipsRouter);

app.use("/api/webhooks", webhooksRouter);

app.use("/api/auth", authRouter);

app.use("/api", userRoutes);
app.use("/api", machineRoutes);

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `GymSync backend corriendo en el puerto ${PORT}`
  );
});