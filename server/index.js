import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import cron from "node-cron";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import { requireAuth } from "./middleware/auth.js";

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

import generateAutoTasks from "./jobs/autoTaskGenerator.js";
import { sendReminders } from "./jobs/reminderJob.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticFilesPath = path.resolve("public");
// const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
  origin.trim().replace(/\/$/, "")
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin))
//         return callback(null, true);
//       return callback(new Error("Not allowed by CORS"));
//     },
//   })
// );

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("Morgan logging in dev mode");
} else {
  app.use(morgan("combined"));
}

app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

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

// app.use("/employees", express.static(path.join(staticFilesPath, "employees")));
app.use("/", express.static(path.join(staticFilesPath, "tours")));
app.use("/api/articles", articleRoutes);

app.use("/api/ai", aiRoutes);

cron.schedule("0 * * * *", generateAutoTasks);
cron.schedule(
  "0 7 * * *",
  () => {
    console.log("[ReminderJob] Running daily reminder job");
    sendReminders();
  },
  { timezone: "Europe/Istanbul" }
);

generateAutoTasks();

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
