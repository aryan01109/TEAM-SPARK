const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema({
  adminId: String,
  name: String,
  email: String,
  department: String,
  language: { type: String, default: "English" },
  notifications: { type: Boolean, default: true },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
