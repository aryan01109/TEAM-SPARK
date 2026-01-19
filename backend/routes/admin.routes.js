import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import Report from "../models/Report.js"; 
import User from "../models/User.js";
import staff from "../models/staff.js";




import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js"

import { getAdminProfile } from "../controllers/adminProfile.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

/* ===============================
   ANALYTICS – DEPARTMENT WISE
   =============================== */
router.get("/reports/analytics/departments", adminAuth, async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        $group: {
          _id: "$department",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $ne: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(data);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Analytics error" });
  }
});

/* ===============================
   TEST DB ACCESS
   =============================== */
router.get("/test-db", async (req, res) => {
  try {
    const count = await Report.countDocuments();
    res.json({
      message: "Database accessible",
      reportCount: count
    });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({
      message: "Database NOT accessible",
      error: err.message
    });
  }
});

/* ===============================
   ADMIN ROUTES
   =============================== */
router.get("/profile", adminAuth, getAdminProfile);
router.get("/dashboard/stats", adminAuth, getDashboardStats);

/* ======================
   ADMIN login
   ====================== */

router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { empId, email, password } = req.body;

    if (!password || (!empId && !email)) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const admin = await Admin.findOne({
      $or: [
        empId ? { empId } : null,
        email ? { email: email.toLowerCase() } : null
      ].filter(Boolean)
    });

    console.log("ADMIN FOUND:", !!admin);

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.password) {
      console.error("ADMIN PASSWORD MISSING IN DB");
      return res.status(500).json({ message: "Admin password not set" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        empId: admin.empId,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ======================
   ADMIN REGISTER
   ====================== */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      empId,
      email,
      password,
      department,
      designation
    } = req.body;

    if (!empId || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Admin.findOne({
      $or: [{ empId }, { email: email.toLowerCase() }]
    });

    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      empId,
      email: email.toLowerCase(),
      password: hashedPassword,
      department,
      designation,
      role: "admin",
      isApproved: true
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        empId: admin.empId,
        email: admin.email
      }
    });

  } catch (err) {
    console.error("ADMIN REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ======================
   GET ALL USERS (ADMIN)
   ====================== */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("USER LOAD ERROR:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
});

/* ======================
   test
====================== */

router.get("/test-users-staff", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const adminsCount = await Admin.countDocuments();

    const users = await User.find().limit(5);
    const admins = await Admin.find().limit(5);

    res.json({
      message: "Backend can access users & staff",
      counts: {
        users: usersCount,
        admins: adminsCount
      },
      sampleUsers: users,
      sampleAdmins: admins
    });
  } catch (err) {
    res.status(500).json({
      message: "Backend cannot access users/staff",
      error: err.message
    });
  }
});


/* ======================
   test
====================== */
router.get("/test-staff", async (req, res) => {
  try {
    const count = await staff.countDocuments();
    const sample = await staff.find().limit(5).select("-password");

    res.json({
      message: "Staff collection accessible",
      totalStaff: count,
      sampleStaff: sample
    });
  } catch (err) {
    res.status(500).json({
      message: "Staff/Admin collection NOT accessible",
      error: err.message
    });
  }
});


/* ======================
   GET ALL REPORTS 
====================== */
router.get("/reports", adminAuth, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.json(reports);
  } catch (err) {
    console.error("REPORT LOAD ERROR:", err);
    res.status(500).json({ message: "Failed to load reports" });
  }
});

export default router;
