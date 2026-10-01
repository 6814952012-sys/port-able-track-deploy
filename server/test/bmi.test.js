const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateBmi, getBmiCategory, getRecommendation } = require("../src/utils/bmi");

test("calculates BMI from kilograms and centimetres", () => {
  assert.equal(calculateBmi(70, 175), 22.9);
});

test("classifies BMI using the app thresholds", () => {
  assert.equal(getBmiCategory(18.4).key, "underweight");
  assert.equal(getBmiCategory(22.9).key, "healthy");
  assert.equal(getBmiCategory(24.9).key, "overweight");
  assert.equal(getBmiCategory(25).key, "obesity");
});

test("returns exercise guidance and references", () => {
  const recommendation = getRecommendation(27);
  assert.equal(recommendation.categoryKey, "obesity");
  assert.ok(recommendation.exercise.length >= 3);
  assert.ok(recommendation.nutrition.eat.length >= 3);
  assert.ok(recommendation.nutrition.limit.length >= 2);
  assert.ok(recommendation.workoutPlan.duration);
  assert.ok(recommendation.workoutPlan.options.every((option) => option.sets && option.details));
  assert.ok(recommendation.references.some((reference) => reference.url.includes("who.int")));
});

test("rejects invalid measurements", () => {
  assert.throws(() => calculateBmi(0, 170), /positive numbers/);
  assert.throws(() => calculateBmi(70, "not-a-number"), /positive numbers/);
});