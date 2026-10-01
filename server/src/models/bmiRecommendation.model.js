const mongoose = require("mongoose");

const bmiRecommendationSchema = new mongoose.Schema(
  {
    categoryKey: { type: String, required: true, unique: true, enum: ["underweight", "healthy", "overweight", "obesity"] },
    category: { type: String, required: true },
    minBmi: { type: Number, required: true, min: 0 },
    maxBmi: { type: Number, required: true },
    exercises: { type: [String], required: true },
    references: [{ title: String, url: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BmiRecommendation", bmiRecommendationSchema);