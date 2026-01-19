import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    media: {
      type: [String],
      default: []
    },

    location: {
      type: String,
      required: true
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },

    status: {
      type: String,
      enum: ["Submitted", "In Progress", "Resolved"],
      default: "Submitted"
    },
    createdAt: {
    type: Date,
    default: Date.now
  }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);


