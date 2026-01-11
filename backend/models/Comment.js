const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue" },
  comment: String,
  commentedBy: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
