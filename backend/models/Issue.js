const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  latitude: Number,
  longitude: Number,
  category: String, // pothole, garbage, light etc
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "In Progress", "Resolved"]
  },
  reportedBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Issue", issueSchema);
