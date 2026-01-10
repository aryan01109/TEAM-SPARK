const express = require("express");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", auth, async (req,res) => {
  try {
    const { issueId, comment } = req.body;
    if (!issueId || !comment) return res.status(400).json({ message: "Missing fields" });
    if (!mongoose.Types.ObjectId.isValid(issueId)) return res.status(400).json({ message: "Invalid issueId" });

    const c = await Comment.create({ issueId, comment, commentedBy: req.user.id });
    res.status(201).json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create comment" });
  }
});

router.get("/:issueId", async (req,res) => {
  try {
    const { issueId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(issueId)) return res.status(400).json({ message: "Invalid issueId" });
    const comments = await Comment.find({ issueId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

module.exports = router;
