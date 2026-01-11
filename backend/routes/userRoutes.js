const express = require("express");
const User = require("../models/User");
const router = express.Router();


router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, govId, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Use email as login ID
    const identifier = email.toLowerCase();

    const exists = await User.findOne({ identifier });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      identifier,
      password,
      role: role || "User",
      govId: role === "Admin" ? govId : "",
      department: role === "Admin" ? department : ""
    });

    res.json({
      message: "Registered successfully",
      userId: user._id
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
