const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["walk", "run", "cycle", "strength", "other"],
    },
    durationMin: { type: Number, required: true, min: 1 },
    distanceKm: { type: Number, min: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema, "activities");
