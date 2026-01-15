const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const auth = require("../middleware/auth");

router.get("/user-dashboard", auth, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId });

    const total = reports.length;
    const resolved = reports.filter(r => r.status === "Resolved").length;
    const active = reports.filter(r => r.status === "Active").length;

    res.json({
      total,
      resolved,
      active,
      reports: reports.map(r => ({
        title: r.title,
        status: r.status
      }))
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
