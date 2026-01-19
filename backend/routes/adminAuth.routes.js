import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

/* ======================
   ADMIN AUTH MIDDLEWARE
   ====================== */
const adminAuth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ======================
   ADMIN PROFILE
   ====================== */
router.get("/profile", adminAuth, async (req, res) => {
  res.json({
    id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role
  });
});

/* ======================
   DASHBOARD STATS
   ====================== */
router.get("/dashboard/stats", adminAuth, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const activeReports = await Report.countDocuments({
      status: { $ne: "Resolved" }
    });

    const users = await User.countDocuments();

    res.json({
      totalReports,
      avgResolution: 0,   
      activeCrews: 0,
      satisfaction: 0,
      activeReports,
      users
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
