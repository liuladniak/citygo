import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import cron from "node-cron";
import express from "express";
import morgan from "morgan";
import { promClient, metricsMiddleware } from "./metrics.js";

import { requireAuth } from "./middleware/auth.js";
import contactRoutes from "./routes/contactRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import paymentRoutes from "./routes/payment.js";
import taskRoutes from "./routes/taskRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import webhook from "./routes/webhook.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import rateLimit from "express-rate-limit";

import generateAutoTasks from "./jobs/autoTaskGenerator.js";
import { sendReminders } from "./jobs/reminderJob.js";

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticFilesPath = path.resolve("public");
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
  origin.trim().replace(/\/$/, ""),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(cleanOrigin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("Morgan logging in dev mode");
} else {
  app.use(morgan("combined"));
}

const miloLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please wait before chatting again." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(metricsMiddleware);
app.use("/api/ai/chat", miloLimiter);

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", requireAuth, bookingRoutes);
app.use("/api/employees", requireAuth, employeeRoutes);
app.use("/api/activity", requireAuth, activityRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/company", requireAuth, companyRoutes);
app.use("/", express.static(path.join(staticFilesPath, "tours")));
app.use("/api/articles", articleRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhook,
);
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
cron.schedule("0 * * * *", generateAutoTasks);
cron.schedule(
  "0 7 * * *",
  () => {
    console.log("[ReminderJob] Running daily reminder job");
    sendReminders();
  },
  { timezone: "Europe/Istanbul" },
);

generateAutoTasks();

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
