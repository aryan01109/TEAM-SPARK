import express from "express";
import jwt from "jsonwebtoken";
import Report from "../models/Report.js";
import { getReports } from "../controllers/report.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* =====================================================
   AUTH MIDDLEWARE (JWT)
===================================================== */
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
}

/* =====================================================
   GET ALL REPORTS (ADMIN / STAFF)
===================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reports" });
  }
});

/* =====================================================
   GET SINGLE REPORT
===================================================== */
router.get("/:reportId", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   CREATE REPORT (CITIZEN)
===================================================== */
router.post("/report", authMiddleware, async (req, res) => {
  try {
    const { title, category, description, location, priority } = req.body;

    //  VALIDATION
    if (!title || !category || !description || !location) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const report = await Report.create({
      userId: req.user.id,     //  comes from authMiddleware
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location.trim(),
      priority: priority || "low",
      status: "Submitted"
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report
    });

  } catch (err) {
    console.error("CREATE REPORT ERROR:", err);
    res.status(500).json({
      message: "Failed to submit report"
    });
  }
});
/* =====================================================
   UPDATE REPORT STATUS (ADMIN / STAFF)
===================================================== */
router.patch("/:reportId/status", auth, async (req, res) => {
  try {
    if (!["admin", "staff"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, note } = req.body;

    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;
    report.timeline.unshift({
      status,
      note,
      by: req.user.role,
      time: new Date()
    });

    await report.save();

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

/* =====================================================
   ASSIGN DEPARTMENT (ADMIN)
===================================================== */
router.patch("/:reportId/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { department, priority } = req.body;

    const report = await Report.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.department = department;
    report.priority = priority;
    report.status = "Assigned";

    report.timeline.unshift({
      status: "Assigned",
      note: `Assigned to ${department}`,
      by: "Admin",
      time: new Date()
    });

    await report.save();

    res.json({ message: "Assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed" });
  }
});

/* =====================================================
   CITIZEN – MY REPORTS
===================================================== */
router.get("/user/:userId", async (req, res) => {
  try {
    const reports = await Report.find({
      "citizen.id": req.params.userId
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user reports" });
  }
});

/* =====================================================
   REPORT LIST
===================================================== */
router.get("/", getReports);
export default router;
