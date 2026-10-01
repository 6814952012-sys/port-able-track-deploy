const express = require("express");
const { getBmiRecords, createBmiRecord, updateBmiRecord } = require("../controllers/bmi.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getBmiRecords);
router.post("/", createBmiRecord);
router.patch("/:id", requireAuth, requireAdmin, updateBmiRecord);

module.exports = router;
