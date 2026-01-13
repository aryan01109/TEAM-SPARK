const express = require("express");
const AdminSettings = require("../models/AdminSettings");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/* Get Admin Settings */
router.get("/", adminAuth, async (req, res) => {
  try {
    const settings = await AdminSettings.findOne({ adminId: req.user.id });
    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

/* Save / Update Settings */
router.put("/", adminAuth, async (req, res) => {
  try {
    const updated = await AdminSettings.findOneAndUpdate(
      { adminId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

/* Change Admin Password */
router.put("/password", adminAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Missing fields" });
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) return res.status(401).json({ message: "Wrong old password" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

module.exports = router;
