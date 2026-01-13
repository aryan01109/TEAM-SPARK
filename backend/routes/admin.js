const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const Issue = require("../models/Issue");

const router = express.Router();

router.put("/issue/:id/status", adminAuth, async (req,res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending","In Progress","Resolved"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const issue = await Issue.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

router.delete("/issue/:id", adminAuth, async (req,res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
