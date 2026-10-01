const mongoose = require("mongoose");
const Activity = require("../models/activity.model");

const activityTypes = new Set(["walk", "run", "cycle", "strength", "other"]);
const allowedFields = new Set(["type", "durationMin", "distanceKm", "date", "note"]);
const dayMs = 24 * 60 * 60 * 1000;

function validateActivityBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object" };
  }
  const unexpected = Object.keys(body).filter((key) => !allowedFields.has(key));
  if (unexpected.length) return { error: `Unexpected field: ${unexpected[0]}` };
  if (!activityTypes.has(body.type)) return { error: "Activity type is invalid" };

  const validNumericInput = (value) => typeof value === "number" || (typeof value === "string" && value.trim() !== "");
  const durationMin = Number(body.durationMin);
  if (!validNumericInput(body.durationMin) || !Number.isFinite(durationMin) || durationMin < 1) {
    return { error: "Duration must be a number of at least 1 minute" };
  }

  const fields = { type: body.type, durationMin };
  if (Object.hasOwn(body, "distanceKm")) {
    if (body.distanceKm === "" || body.distanceKm === null) {
      fields.distanceKm = null;
    } else {
      const distanceKm = Number(body.distanceKm);
      if (!validNumericInput(body.distanceKm) || !Number.isFinite(distanceKm) || distanceKm < 0) return { error: "Distance must be a non-negative number" };
      fields.distanceKm = distanceKm;
    }
  }
  if (Object.hasOwn(body, "date") && body.date !== "") {
    const date = new Date(body.date);
    if (Number.isNaN(date.getTime())) return { error: "Date is invalid" };
    fields.date = date;
  }
  if (Object.hasOwn(body, "note") && body.note !== null) {
    if (typeof body.note !== "string") return { error: "Note must be a string" };
    const note = body.note.trim();
    if (note.length > 200) return { error: "Note must be 200 characters or fewer" };
    fields.note = note;
  }
  return { fields };
}

function getActivityId(req, res) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid activity id" });
    return null;
  }
  return id;
}

const getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const { fields, error } = validateActivityBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const activity = await Activity.create({ ...fields, user: req.user._id });
    res.status(201).json(activity);
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    next(error);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const id = getActivityId(req, res);
    if (!id) return;
    const { fields, error } = validateActivityBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const activity = await Activity.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: fields },
      { new: true, runValidators: true }
    );
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.status(200).json(activity);
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    next(error);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const id = getActivityId(req, res);
    if (!id) return;
    const activity = await Activity.findOneAndDelete({ _id: id, user: req.user._id });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.status(200).json({ message: "Activity deleted" });
  } catch (error) {
    next(error);
  }
};

const getActivityStats = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const mondayOffset = (new Date(todayStart).getUTCDay() + 6) % 7;
    const weekStart = new Date(todayStart - mondayOffset * dayMs);
    const weeklyActivities = await Activity.find({
      user: req.user._id,
      date: { $gte: weekStart, $lte: now },
    }).sort({ date: 1 });
    const pastActivities = await Activity.find({ user: req.user._id, date: { $lte: now } }).select("date").sort({ date: -1 });

    const activeDays = new Set(pastActivities.map((activity) => new Date(activity.date).toISOString().slice(0, 10)));
    let streak = 0;
    let streakDay = todayStart;
    if (!activeDays.has(new Date(streakDay).toISOString().slice(0, 10))) streakDay -= dayMs;
    while (activeDays.has(new Date(streakDay).toISOString().slice(0, 10))) {
      streak += 1;
      streakDay -= dayMs;
    }

    const totalDistanceKm = weeklyActivities.reduce((total, activity) => total + (activity.distanceKm || 0), 0);
    res.status(200).json({
      totalSessions: weeklyActivities.length,
      totalMinutes: weeklyActivities.reduce((total, activity) => total + activity.durationMin, 0),
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      streak,
      weekStart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
  validateActivityBody,
};
