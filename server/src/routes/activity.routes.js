const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
} = require("../controllers/activity.controller");

const router = express.Router();

router.use(requireAuth);
router.get("/", getActivities);
router.post("/", createActivity);
router.get("/stats", getActivityStats);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

module.exports = router;
