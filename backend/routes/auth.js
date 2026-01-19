import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

import User from "../models/User.js";
import Staff from "../models/staff.js";
import Report from "../models/Report.js";
import Community from "../models/CommunityPost.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ======================
   MULTER CONFIG
====================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

/* ======================
   USER LOGIN
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginEmail = (email || identifier)?.toLowerCase().trim();

    const user = await User.findOne({ email: loginEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* ======================
   USER REGISTER
====================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      role: "user",
      status: "approved"
    });

    res.status(201).json({
      message: "Registered successfully",
      userId: user._id
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* ======================
   USER DASHBOARD (LIVE SAFE)
====================== */
router.get("/user-dashboard", auth, async (req, res) => {
  try {
    const reports = await Report
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const total = reports.length;
    const resolved = reports.filter(r => r.status === "Resolved").length;
    const active = reports.filter(r => r.status !== "Resolved").length;

    res.json({
      total,
      resolved,
      active,
      reports
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Dashboard error" });
  }
});

/* ======================
   SUBMIT REPORT (USER)
====================== */
router.post("/report", auth, upload.array("media", 5), async (req, res) => {
  try {
    const { category, description, lat, lng } = req.body;

    if (!category || !description || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const files = (req.files || []).map(f => f.filename);

    const report = await Report.create({
      userId: req.user.id,
      title: category,
      category,
      description,
      media: files,
      location: `${lat}, ${lng}`,
      status: "Submitted"
    });

    await Community.create({
      reportId: report._id,
      userId: req.user.id,
      userName: req.user.name || "Citizen",
      title: category,
      description,
      location: `${lat}, ${lng}`,
      beforeImage: files[0] || null,
      likes: 0
    });

    res.status(201).json({
      success: true,
      reportId: report._id
    });

  } catch (err) {
    console.error("REPORT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit report"
    });
  }
});

/* ======================
   COMMUNITY FEED (AUTH)
====================== */
router.get("/community", auth, async (req, res) => {
  try {
    const posts = await Community
      .find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);

  } catch (err) {
    console.error("COMMUNITY ERROR:", err);
    res.status(500).json({ message: "Community load failed" });
  }
});

/* ======================
   LIKE COMMUNITY POST
====================== */
router.post("/community/like/:id", auth, async (req, res) => {
  try {
    await Community.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Like failed" });
  }
});

/* ======================
   STAFF LOGIN
====================== */
router.post("/staff/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email }).select("+password");
    if (!staff) return res.status(401).json({ message: "Staff not found" });

    if (!staff.isActive) {
      return res.status(403).json({ message: "Awaiting approval" });
    }

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: staff._id, role: "staff" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: "staff",
      name: staff.name
    });

  } catch (err) {
    console.error("STAFF LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ======================
   STAFF REGISTER
====================== */
router.post("/register", async (req, res) => {
  console.log("Staff registration attempt");
  try {
    const { name, email, password, department, empId } = req.body;

    if (!name || !email || !password || !department || !empId) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!email.endsWith(".gov")) {
      return res.status(400).json({
        message: "Only .gov emails allowed"
      });
    }

    const exists = await Staff.findOne({
      $or: [{ email }, { empId }]
    });

    if (exists) {
      return res.status(409).json({
        message: "Staff already exists"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await Staff.create({
      name,
      email,
      password: hash,
      department,
      empId,
      isActive: false // waiting for approval
    });

    res.status(201).json({
      message: "Staff registered successfully. Awaiting approval."
    });

  } catch (err) {
    console.error("STAFF REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// /* ======================
//    COMMUNITY FEED
// ====================== */
router.get("/community", auth, async (req, res) => {
  const posts = await Community.find().sort({ createdAt: -1 });
  res.json(posts);
});

// /* ======================
//    LIKE POST
// ====================== */
router.post("/community/like/:id", auth, async (req, res) => {
  await Community.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
  res.json({ success: true });
});

// /* =====================
//    RESET PASSWORD
// ===================== */
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

// /* =====================
//    FORGOT PASSWORD
// ===================== */
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


export default router;



