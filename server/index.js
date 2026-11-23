import { env } from "./config/env.js";

import path from "path";

import cors from "cors";
import cron from "node-cron";
import http from "node:http";
import express from "express";
import morgan from "morgan";
import { promClient, metricsMiddleware } from "./metrics.js";

import { requireAuth, authenticateToken } from "./middleware/auth.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import activityRoutes from "./modules/activity/activity.routes.js";
import aiRoutes from "./routes/aiRoutes.js";
import articleRoutes from "./modules/articles/articles.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import guestRoutes from "./modules/guest/guest.routes.js";
import companyRoutes from "./modules/company/company.routes.js";
import employeeRoutes from "./modules/employees/employees.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import taskRoutes from "./modules/tasks/tasks.routes.js";
import tourRoutes from "./routes/tourRoutes.js";
import webhook from "./routes/webhook.js";
import reviewRoutes from "./modules/reviews/reviews.routes.js";
import miloRoutes, { deleteOldMiloMessages } from "./routes/miloRoutes.js";
import miloHandoffRoutes from "./routes/miloHandoffRoutes.js";
import miloReviewRoutes from "./routes/miloReviewRoutes.js";
import { createRealtime } from "./realtime/index.js";
import { dbStore } from "./realtime/dbStore.js";
import { notifyTelegram } from "./lib/telegram.js";
import rateLimit from "express-rate-limit";

import generateAutoTasks from "./jobs/autoTaskGenerator.js";
import { sendReminders } from "./jobs/reminderJob.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
// One proxy hop (Nginx Proxy Manager) sits in front of the API, so req.ip and the
// rate limiters see the real visitor IP from X-Forwarded-For.
app.set("trust proxy", 1);
const PORT = env.PORT;
const staticFilesPath = path.resolve("public");
const allowedOrigins = env.ALLOWED_ORIGINS;

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

if (env.NODE_ENV === "development") {
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

// Stripe signs the raw request body, so this route must come before express.json(),
// which would replace the body with a parsed object and break signature checks.
app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(staticFilesPath));
app.use(metricsMiddleware);
app.use("/api/ai/chat", miloLimiter);

app.use("/auth", profileRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/client", guestRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", requireAuth, bookingRoutes);
app.use("/api/employees", requireAuth, employeeRoutes);
app.use("/api/activity", requireAuth, activityRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/company", requireAuth, companyRoutes);
app.use("/", express.static(path.join(staticFilesPath, "tours")));
app.use("/api/articles", articleRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/milo/handoff", miloHandoffRoutes);
app.use("/api/milo/review", miloReviewRoutes);
app.use("/api/milo", miloRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
cron.schedule("0 * * * *", () => generateAutoTasks());
cron.schedule(
  "0 7 * * *",
  () => {
    console.log("[ReminderJob] Running daily reminder job");
    sendReminders();
  },
  { timezone: "Europe/Istanbul" },
);

cron.schedule(
  "30 3 * * *",
  async () => {
    await deleteOldMiloMessages();
    await dbStore.deleteOldConversations(90);
  },
  { timezone: "Europe/Istanbul" },
);

// Live chat for Milo's human handoff (Socket.IO on the same port).
const server = http.createServer(app);
const realtime = createRealtime(server, {
  store: dbStore,
  authenticateAgent: authenticateToken,
  allowedOrigins,
  agentName: env.MILO_AGENT_NAME,
  notify: notifyTelegram,
  consoleUrl: env.MILO_CONSOLE_URL,
});
// Requests nobody picks up within 5 minutes become "missed".
cron.schedule("* * * * *", () => {
  realtime.expireWaiting(5).catch((err) => console.error("[Milo] expire failed:", err.message));
});

generateAutoTasks();

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
