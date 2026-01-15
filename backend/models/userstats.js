import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },
  reports: {
    type: Number,
    default: 0
  },
  resolved: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  photos: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("UserStats", userStatsSchema);
