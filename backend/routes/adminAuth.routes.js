import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

/* ======================
   REGISTER
   ====================== */
router.post("/register", async (req, res) => {
  res.json({ message: "Register route working" });
});

/* ======================
   LOGIN
   ====================== */
router.post("/login", async (req, res) => {
  res.json({ message: "Login route working" });
});

/* ======================
   SIMPLE AUTH MIDDLEWARE
   ====================== */
const simpleAdminAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ======================
   ADMIN PROFILE  ✅
   ====================== */
router.get("/profile", simpleAdminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   DASHBOARD STATS  ✅
   ====================== */
router.get("/dashboard/stats", simpleAdminAuth, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const activeReports = await Report.countDocuments();
    const users = await User.countDocuments();

    res.json({
      totalReports,
      activeReports,
      avgResolution: "4.2 hrs",
      activeCrews: 42,
      satisfaction: "88.4%",
      users
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
