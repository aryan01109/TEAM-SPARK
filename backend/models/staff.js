import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  department: String,
  employeeId: String,
  status: { type: String, default: "pending" }
});

export default mongoose.model("Staff", staffSchema);
