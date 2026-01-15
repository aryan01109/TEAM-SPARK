const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },

  message: {
    type: String,
    required: true
  },

  email: {
    type: String,
    default: null
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
