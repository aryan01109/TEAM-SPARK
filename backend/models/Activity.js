import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: String,
  points: Number
}, { timestamps: true });

export default mongoose.model("Activity", activitySchema);
