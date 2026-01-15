import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  title: String,
  description: String,
  category: String,
  location: String,
  beforeImage: String,
  afterImage: String,
  likes: { type: Number, default: 0 },
  impactScore: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CommunityPost", communityPostSchema);
