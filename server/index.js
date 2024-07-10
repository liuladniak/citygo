import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
