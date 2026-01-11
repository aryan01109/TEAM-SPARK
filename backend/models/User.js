const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, sparse: true },
  identifier: { type: String, unique: true, sparse: true }, // IMPORTANT

  password: { type: String, required: true },
  role: { type: String, default: "User" },

  govId: { type: String, default: "" },
  department: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
