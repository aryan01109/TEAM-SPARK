const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const router = express.Router();

const Staff = require("../models/staff");
// console.log("AUTH ROUTES FILE LOADED");

/* =====================
   USER REGISTER
===================== */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role, identifier } = req.body;

    if (!email && identifier) email = identifier;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role: role || "User",
      status: "approved"
    });

    res.json({ message: "Registration successful" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   STAFF REGISTER
===================== */
router.post("/staff/register", async (req, res) => {
  try {
    const { name, email, password, department, employeeId } = req.body;

    console.log("STAFF REGISTER:", req.body);

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
      employeeId
    });

    res.json({ message: "Staff registration submitted for approval" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   LOGIN (User/Admin)
===================== */
router.post("/login", async (req, res) => {
  try {
    let { identifier, email, password } = req.body;
    if (!email && identifier) email = identifier;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    if (user.role === "Staff" && user.status !== "approved") {
      return res.status(403).json({ message: "Awaiting admin approval" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   STAFF LOGIN (SSO)
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
      { id: staff._id, role: "Staff" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: "Staff", name: staff.name });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   FORGOT PASSWORD
====================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `http://127.0.0.1:5500/TEAM-SPARK/civic/html/auth/ResetPassword.html?token=${token}`;
    console.log("RESET LINK:", resetLink);

    res.json({ message: "Reset link sent", resetLink });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================
   RESET PASSWORD
====================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password updated" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
