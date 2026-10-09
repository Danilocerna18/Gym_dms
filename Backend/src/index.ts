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
import { webhooksRouter } from "./routes/webhooks.route";

import "./config/passport";

import authRouter from "./routes/auth";
import userRoutes from "./routes/user.routes";

const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ??
      "http://localhost:4200",

    credentials: true,
  })
);

app.use(express.json());

app.use(sessionMiddleware);

app.use(passport.initialize());

app.use(passport.session());

app.use("/api/auth", authRateLimit);

app.use("/api/scan", scanRateLimit);

app.use("/api/scan", scanRouter);

app.use("/api/access", accessRouter);

app.use("/api/clientes", clientesRouter);

app.use("/api/webhooks", webhooksRouter);

app.use("/api/auth", authRouter);

app.use("/api", userRoutes);

app.use(errorHandler); 

app.listen(PORT, () => {
  console.log(
    `GymSync backend corriendo en http://localhost:${PORT}`
  );
});