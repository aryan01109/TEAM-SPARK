const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const Admin = require("./models/Admin");

const app = express();

/* -------------------- Middleware -------------------- */
app.use(cors());                 // Fix CORS error
app.use(express.json());         // Read JSON body

/* -------------------- MongoDB -------------------- */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Error:", err));

/* -------------------- MODELS -------------------- */
// const User = mongoose.model(
//   "User",
//   new mongoose.Schema({
//     name: String,
//     email: String,
//     password: String,
//     role: { type: String, default: "user" },
//     createdAt: { type: Date, default: Date.now }
//   })
// );

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

/* -------------------- TEST ROUTE -------------------- */
app.get("/", (req, res) => {
  res.send("TEAM-SPARK API running ");
});

/* -------------------- AUTH -------------------- */


app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role, govId, department } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    if (role === "Admin") {
      if (!govId || !department)
        return res.status(400).json({ message: "Admin verification required" });

      const exists = await Admin.findOne({ email });
      if (exists) return res.status(400).json({ message: "Admin already exists" });

      const admin = await Admin.create({
        name, email, password, govId, department
      });

      return res.json({
        message: "Admin registered. Awaiting approval",
        adminId: admin._id
      });
    }

    // User
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    res.json({
      message: "User registered successfully",
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- DASHBOARD STATS -------------------- */
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

/* -------------------- ISSUES -------------------- */
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

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
