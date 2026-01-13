const express = require("express");
const Issue = require("../models/Issue");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../utils/upload");

const router = express.Router();

  // CREATE ISSUE (Citizen)

router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, category, priority, lat, lng } = req.body;
    if (!title || !lat || !lng) return res.status(400).json({ message: "Missing required fields" });

    const imageUrls = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    const issue = await Issue.create({
      title: title,
      description: description || "",
      category: category || "other",
      priority: Number(priority) || 1,
      latitude: Number(lat),
      longitude: Number(lng),
      images: imageUrls,
      reportedBy: req.user.id
    });

    res.status(201).json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create issue" });
  }
});


//   GET ALL ISSUES (Public)

router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//   GET SINGLE ISSUE

router.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("reportedBy", "name email");
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch issue" });
  }
});


//   UPDATE ISSUE (Citizen)

router.put("/:id", auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Whitelist fields that a citizen can update
    const updatable = (({ title, description, category, priority }) => ({ title, description, category, priority }))(req.body);

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: updatable },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});


//   DELETE ISSUE (Citizen)

router.delete("/:id", auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await issue.deleteOne();
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});


//   ADMIN: Update Status

router.put("/admin/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending","In Progress","Resolved"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
});

//   ADMIN: Delete Issue

router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: "Issue removed by admin" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
