import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  // Public report ID (CR-928312)
  reportId: {
    type: String,
    unique: true
  },

  // Who submitted it
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Display title
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  category: {
    type: String,
    required: true
  },

  // Submitted → In Progress → Resolved
  status: {
    type: String,
    enum: ["Submitted", "In Progress", "Resolved"],
    default: "Submitted"
  },

  // Uploaded images
  media: [String],

  // GPS or readable location
  location: {
    type: String
  },

  // Community reactions
  likes: {
    type: Number,
    default: 0
  },
  celebrates: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Report", reportSchema);
