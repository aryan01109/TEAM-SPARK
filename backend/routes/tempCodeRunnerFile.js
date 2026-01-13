const express = require("express");
// const router = express.Router();
// const User = require("../models/User");

// /* ===========================
//    TEST ROUTE
// =========================== */
// router.get("/test", (req, res) => {
//   res.send("AUTH ROUTES WORKING");
// });

// /* ===========================
//    REGISTER
// =========================== */
// router.post("/register", async (req, res) => {
//   try {
//     const { name, password, role, identifier, email, govId, department } = req.body;

//     if (!name || !password || !role) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     // -------- ADMIN --------
//     if (role === "Admin") {
//       if (!email || !govId || !department) {
//         return res.status(400).json({ message: "Admin fields missing" });
//       }

//       const adminExists = await User.findOne({
//         $or: [{ email }, { govId }]
//       });

//       if (adminExists) {
//         return res.status(400).json({ message: "Admin already exists" });
//       }

//       const admin = await User.create({
//         name,
//         email,
//         password,
//         role: "Admin",
//         govId,
//         department
//       });

//       return res.json({
//         message: "Admin registered",
//         id: admin._id
//       });
//     }

//     // -------- USER --------
//     if (!identifier) {
//       return res.status(400).json({ message: "Identifier required" });
//     }

//     const userExists = await User.findOne({ identifier });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const user = await User.create({
//       name,
//       identifier,
//       email: identifier.includes("@") ? identifier : "",
//       password,
//       role: "User"
//     });

//     res.json({
//       message: "User registered",
//       id: user._id
//     });

//   } catch (err) {
//     console.error("REGISTER ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* ===========================
//    LOGIN
// =========================== */
// router.post("/login", async (req, res) => {
//   try {
//     const { identifier, password, govId } = req.body;

//     let user;

//     // Admin login
//     if (govId) {
//       user = await User.findOne({ govId });
//     } 
//     // User login
//     else {
//       user = await User.findOne({ identifier });
//     }

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     if (user.password !== password) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     res.json({
//       message: "Login successful",
//       token: "auth-" + user._id,
//       role: user.role === "Admin" ? "admin" : "user",
//       username: user.name
//     });

//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;
