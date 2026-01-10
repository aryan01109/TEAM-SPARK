const express = require("express");
const Issue = require("../models/Issue");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/* GET all issues for map */
router.get("/issues", adminAuth, async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
});

/* UPDATE issue status */
router.put("/issue/:id", adminAuth, async (req, res) => {
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

module.exports = router;
