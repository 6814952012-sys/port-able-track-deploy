const express = require("express");
const { getBmiRecommendation, calculateBmiRecommendation } = require("../controllers/bmiRecommendation.controller");

const router = express.Router();

router.get("/", getBmiRecommendation);
router.post("/calculate", calculateBmiRecommendation);

module.exports = router;