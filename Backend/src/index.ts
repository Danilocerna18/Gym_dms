import "dotenv/config";
import express from "express";
import cors from "cors";
import { sessionMiddleware } from "./config/session";
import { authRateLimit, scanRateLimit } from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { scanRouter } from "./routes/scan.route";
import { accessRouter } from "./routes/access.route";
import { webhooksRouter } from "./routes/webhooks.route";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:4200",
    credentials: true,
  }),
);
app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/auth", authRateLimit);
app.use("/api/scan", scanRateLimit);

app.use("/api/scan", scanRouter);
app.use("/api/access", accessRouter);
app.use("/api/webhooks", webhooksRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GymSync backend escuchando en el puerto ${PORT}`);
});
