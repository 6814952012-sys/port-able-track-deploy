const BmiRecord = require("../models/bmiRecord.model");

const getBmiRecords = async (req, res, next) => {
  try {
    const filter = req.query.user ? { user: req.query.user } : {};
    const records = await BmiRecord.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const createBmiRecord = async (req, res, next) => {
  try {
    const record = await BmiRecord.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

const updateBmiRecord = async (req, res, next) => {
  try {
    const allowed = ["weight", "height", "waist", "chest", "hip", "bmi", "category"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const record = await BmiRecord.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: "BMI record not found" });
    res.json(record);
  } catch (error) {
    next(error);
  }
};

module.exports = { getBmiRecords, createBmiRecord, updateBmiRecord };
