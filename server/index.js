import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const staticFilesPath = path.resolve("public");
app.use("/", express.static(path.join(staticFilesPath, "tours")));

const allowedOrigins = process.env.CLIENT_URLS.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(helmet());
  console.log("Helmet security enabled in production");
}

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("Morgan logging in dev mode");
} else {
  app.use(morgan("combined"));
  console.log("Morgan logging in combined mode (production)");
}

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
