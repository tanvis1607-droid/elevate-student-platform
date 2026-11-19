import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "Elevate API" }));
app.use("/api/auth", authRoutes);
app.use("/api", dataRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/elevate")
  .then(() => app.listen(port, () => console.log(`Elevate API running on http://localhost:${port}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
