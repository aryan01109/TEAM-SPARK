const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ---------------- Middleware ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- MongoDB ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

/* ---------------- Models ---------------- */
const Issue = mongoose.model(
  "Issue",
  new mongoose.Schema({
    title: String,
    location: String,
    department: String,
    status: String,
    priority: String,
    submittedDate: { type: Date, default: Date.now }
  })
);

/* ---------------- Routes ---------------- */
app.get("/", (req, res) => {
  res.send("TEAM-SPARK API running");
});

app.get("/api/user/statistics", async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: "resolved" });
    const inProgress = await Issue.countDocuments({ status: "in-progress" });
    const pending = await Issue.countDocuments({ status: "pending" });

    res.json({
      submittedIssues: {
        total,
        byStatus: { resolved, inProgress, pending }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/issues", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ submittedDate: -1 }).limit(20);
    res.json({ data: issues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/issues", async (req, res) => {
  try {
    const issue = await Issue.create(req.body);
    res.json({ message: "Issue created", issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- Auth routes ---------------- */
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
