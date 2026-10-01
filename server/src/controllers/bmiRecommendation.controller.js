const { calculateBmi, getRecommendation } = require("../utils/bmi");

const getBmiRecommendation = (req, res, next) => {
  try {
    const bmi = Number(req.query.bmi);
    if (!Number.isFinite(bmi) || bmi <= 0) return res.status(400).json({ message: "BMI must be a positive number" });
    res.json({ bmi, ...getRecommendation(bmi) });
  } catch (error) {
    next(error);
  }
};

const calculateBmiRecommendation = (req, res, next) => {
  try {
    const bmi = calculateBmi(req.body.weight, req.body.height);
    res.json({ bmi, ...getRecommendation(bmi) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getBmiRecommendation, calculateBmiRecommendation };