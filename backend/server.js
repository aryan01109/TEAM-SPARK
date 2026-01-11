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

app.post("/api/register", async (req, res) => {
  try {
    const { name, password, role, identifier, email, govId, department } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (role === "Admin") {
      if (!email || !govId || !department) {
        return res.status(400).json({ message: "Admin fields missing" });
      }

      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Admin already exists" });

      const admin = await User.create({
        name,
        email,
        password,
        role,
        govId,
        department
      });

      return res.json({ message: "Admin registered", id: admin._id });
    }

    // USER
    if (!identifier) {
      return res.status(400).json({ message: "Identifier required" });
    }

    const exists = await User.findOne({ identifier });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      identifier,
      email: identifier,
      password,
      role
    });

    res.json({ message: "User registered", id: user._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
