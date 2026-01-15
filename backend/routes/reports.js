const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const jwt = require("jsonwebtoken");

// Middleware to verify user
function auth(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

/* ===========================
   3️⃣ GET LIVE REPORT STATUS
=========================== */
router.get("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    res.json(report);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   4️⃣ ADMIN UPDATE STATUS
=========================== */
router.post("/update-status", auth, async (req, res) => {
  try {
    if (req.user.role !== "Staff")
      return res.status(403).json({ message: "Access denied" });

    const { reportId, status, message } = req.body;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status;
    report.timeline.unshift({
      status,
      message
    });

    await report.save();

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// Citizen submits report
router.post("/reports", async (req, res) => {
  const { title, category, description, location, citizen } = req.body;

  const report = await Report.create({
    title,
    category,
    description,
    location,
    citizen,
    timeline: [
      {
        status: "Submitted",
        note: "Report received by CityFix system",
        time: new Date()
      }
    ]
  });

  res.json(report);
});

// Get single report (for citizen)
router.get("/reports/:id", async (req, res) => {
  const report = await Report.findById(req.params.id);
  res.json(report);
});

// Admin updates report status
router.patch("/reports/:id/status", async (req, res) => {
  const { status, note } = req.body;

  const report = await Report.findById(req.params.id);

  report.status = status;
  report.timeline.unshift({
    status,
    note,
    time: new Date()
  });

  await report.save();
  res.json({ message: "Status updated" });
});


// Admin assigns report to department
router.patch("/reports/:id/assign", async (req,res)=>{
  const { department, priority } = req.body;

  const report = await Report.findById(req.params.id);

  report.department = department;
  report.priority = priority;
  report.status = "Assigned";

  report.timeline.unshift({
    status: "Assigned",
    note: `Assigned to ${department}`,
    by: "City Admin",
    time: new Date()
  });

  await report.save();
  res.json({ message: "Assigned successfully" });
});


router.get("/my-reports/:userId", async (req, res) => {
  try {
    const reports = await Report.find({
      "citizen.id": req.params.userId
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reports" });
  }
});

module.exports = router;