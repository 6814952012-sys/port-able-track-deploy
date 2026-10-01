const mongoose = require("mongoose");

const bmiRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    bmi: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["น้ำหนักน้อย", "น้ำหนักปกติ", "น้ำหนักเกิน", "โรคอ้วน"],
    },
    waist: { type: Number },
    chest: { type: Number },
    hip: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BmiRecord", bmiRecordSchema);
