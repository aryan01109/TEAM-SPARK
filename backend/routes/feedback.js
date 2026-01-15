const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const auth = require("../middleware/auth");

/* ===============================
   SUBMIT FEEDBACK
================================ */
router.post("/", auth, async (req, res) => {
  try {
    const { subject, message, email, rating } = req.body;

    if (!subject || !message || !rating) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const fb = await Feedback.create({
      subject,
      message,
      email,
      rating,
      userId: req.user.id
    });

    res.json({ message: "Feedback submitted", id: fb._id });
  } catch (err) {
    console.error("FEEDBACK:", err);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

/* ===============================
   ADMIN – VIEW ALL FEEDBACK
================================ */
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const data = await Feedback.find().sort({ createdAt: -1 });
  res.json(data);
});

module.exports = router;
