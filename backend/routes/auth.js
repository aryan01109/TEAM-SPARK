import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";

import Community from "../models/CommunityPost.js";
import User from "../models/User.js";
import Staff from "../models/staff.js";
import Report from "../models/Report.js";
import UserStats from "../models/userstats.js";
import Activity from "../models/Activity.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ======================
   MULTER CONFIG
====================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

/* =====================
   USER REGISTER
===================== */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, identifier } = req.body;
    if (!email && identifier) email = identifier;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hash,
      role: "User",
      status: "approved"
    });

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.error("REGISTER:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   STAFF REGISTER
===================== */
router.post("/staff/register", async (req, res) => {
  try {
    const { name, email, password, department, employeeId } = req.body;

    if (!email.endsWith(".gov")) {
      return res.status(400).json({ message: "Only .gov emails allowed" });
    }

    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ message: "Staff already exists" });

    const hash = await bcrypt.hash(password, 10);

    await Staff.create({
      name,
      email,
      password: hash,
      department,
      employeeId,
      status: "pending"
    });

    res.json({ message: "Staff registration submitted for approval" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   USER LOGIN
===================== */
router.post("/login", async (req, res) => {
  const { email, identifier, password } = req.body;
  const loginEmail = email || identifier;

  const user = await User.findOne({ email: loginEmail });
  if (!user) return res.status(400).json({ message: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, role: user.role, name: user.name });
});

/* =====================
   STAFF LOGIN
===================== */
router.post("/staff/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(400).json({ message: "Staff not found" });

    if (staff.status !== "approved") {
      return res.status(403).json({ message: "Awaiting admin approval" });
    }

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: staff._id.toString(), role: "Staff" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: "Staff", name: staff.name });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   FORGOT PASSWORD
===================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `http://127.0.0.1:5500/civic/html/auth/ResetPassword.html?token=${token}`;
    console.log("RESET LINK:", resetLink);

    res.json({ message: "Reset link sent", resetLink });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   RESET PASSWORD
===================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   USER DASHBOARD
===================== */
router.get("/user-dashboard", auth, async (req, res) => {
  const reports = await Report.find({ userId: req.user.id });

  res.json({
    total: reports.length,
    resolved: reports.filter(r => r.status === "Resolved").length,
    active: reports.filter(r => r.status !== "Resolved").length,
    reports
  });
});

/* =====================
   REPORT SUBMIT
===================== */
router.post("/report", auth, upload.array("media", 5), async (req, res) => {
  try {
    const { category, description, lat, lng } = req.body;
    const files = (req.files || []).map(f => f.filename);

    if (!category || !description)
      return res.status(400).json({ message: "Missing fields" });

    // Create report
    const report = await Report.create({
      userId: req.user.id,
      title: category, //  REQUIRED
      category,
      description,
      media: files,
      location: `${lat}, ${lng}`,
      status: "Submitted"
    });

    // Community Post
    await Community.create({
      reportId: report._id,
      userId: req.user.id,
      userName: req.user.name,
      title: category,
      description,
      category,
      location: `${lat}, ${lng}`,
      beforeImage: files[0] || null,
      afterImage: null,
      impactScore: 1,
      likes: 0
    });

    // User Stats
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = await UserStats.create({
        userId: req.user.id,
        reports: 0,
        photos: 0,
        points: 0
      });
    }

    stats.reports++;
    stats.photos += files.length;
    stats.points += 10;
    await stats.save();

    // Activity
    await Activity.create({
      userId: req.user.id,
      title: `Reported ${category}`,
      points: 10
    });

    console.log("REPORT SAVED");
    console.log("COMMUNITY POST CREATED");
    console.log("STATS UPDATED");

    res.json({
      success: true,
      message: "Report submitted successfully",
      reportId: report._id
    });

  } catch (err) {
    console.error("REPORT ERROR:", err);
    res.status(500).json({ message: "Failed to submit report" });
  }
});

/* ======================
   MY REPORTS
====================== */
router.get("/my-reports", auth, async (req, res) => {
  const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(reports);
});


/* ================================
   USER DASHBOARD (PROFILE PAGE)
================================ */
router.get("/user-dashboard", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Reports
    const reports = await Report.find({ userId });

    const total = reports.length;
    const resolved = reports.filter(r => r.status === "Resolved").length;
    const active = total - resolved;

    // Stats
    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      stats = await UserStats.create({
        userId,
        reports: total,
        resolved,
        points: total * 20
      });
    }

    res.json({
      total,
      resolved,
      active,
      points: stats.points
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

/* ======================
   SUBMIT REPORT
====================== */
router.post("/", auth, upload.array("media", 5), async (req, res) => {
  try {
    const { category, description, lat, lng } = req.body;
    const files = req.files.map(f => f.filename);

    if (!category || !description) {
      return res.status(400).json({ message: "Missing fields" });
    }

    /* -----------------------
       1. CREATE REPORT
    ------------------------ */
    const report = await Report.create({
      userId: req.user.id,
      title: category,
      category,
      description,
      media: files,
      location: `${lat}, ${lng}`,
      status: "Submitted"
    });

    /* -----------------------
       2. CREATE COMMUNITY POST
    ------------------------ */
    await Community.create({
      reportId: report._id,
      userId: req.user.id,
      userName: req.user.name,
      title: category,
      description,
      category,
      location: `${lat}, ${lng}`,
      beforeImage: files[0] || null,
      afterImage: null,
      impactScore: 1,
      likes: 0,
      celebrates: 0
    });

    /* -----------------------
       3. USER STATS (XP)
    ------------------------ */
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = await UserStats.create({
        userId: req.user.id,
        reports: 0,
        photos: 0,
        points: 0
      });
    }

    const oldXP = stats.points;
    const earnedXP = 50;

    stats.reports += 1;
    stats.photos += files.length;
    stats.points += earnedXP;
    await stats.save();

    /* -----------------------
       4. ACTIVITY LOG
    ------------------------ */
    await Activity.create({
      userId: req.user.id,
      title: `Reported ${category}`,
      points: earnedXP
    });

    /* -----------------------
       5. HUMAN REPORT ID
    ------------------------ */
    const reportId = "CFX-" + Math.floor(10000 + Math.random() * 90000);

    /* -----------------------
       6. RETURN TO FRONTEND
    ------------------------ */
    res.json({
      success: true,
      message: "Report submitted successfully",
      lastReport: {
        reportId,
        title: category,
        location: `${lat}, ${lng}`,
        mongoId: report._id,
        oldXP,
        newXP: stats.points
      }
    });

  } catch (err) {
    console.error("REPORT ERROR:", err);
    res.status(500).json({ message: "Failed to submit report" });
  }
});


export default router;
