require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// CORS
app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(express.json());

// Test route
app.get("/__test", (req,res)=>{
  res.send("SERVER OK");
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error", err));

// Load API routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

// 404 for API only
app.use("/api", (req,res)=>{
  res.status(404).json({ message: "API route not found" });
});

// Start server
app.listen(5000, () => {
  console.log("SERVER RUNNING ON 5000");
});
