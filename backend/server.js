import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import adminAuthRoutes from "./routes/adminAuth.routes.js";

dotenv.config();

/* ======================
   INIT APP  ✅ FIRST
   ====================== */
const app = express();

/* ======================
   MIDDLEWARE
   ====================== */
app.use(cors());
app.use(express.json());

/* ======================
   ROUTES  ✅ AFTER app
   ====================== */
app.use("/api/admin", adminAuthRoutes);

/* ======================
   ROOT CHECK
   ====================== */
app.get("/", (req, res) => {
  res.send("Admin backend running");
});

/* ======================
   DATABASE
   ====================== */
mongoose.connect(process.env.MONGO_URI)
  

/* ======================
   START SERVER
   ====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
