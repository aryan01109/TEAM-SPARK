import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import communityRoutes from "./routes/community.js";

const app = express();

// CORS
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// Routes
app.use("/api", authRoutes);
app.use("/api/community", communityRoutes);

// Start
app.listen(5000, () => {
  console.log("SERVER RUNNING ON 5000");
});
