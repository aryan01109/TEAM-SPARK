import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  status: String,
  resetToken: String,
  resetTokenExpiry: Date
});

export default mongoose.model("User", userSchema);
