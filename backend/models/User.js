const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true }, // mobile/email/username
  password: { type: String, required: true },
  securityCode: { type: String }
});

module.exports = mongoose.model("User", userSchema);
