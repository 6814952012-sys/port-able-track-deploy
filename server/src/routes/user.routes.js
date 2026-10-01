const express = require("express");
const { getUsers, getUserById, createUser, loginUser, updateUser } = require("../controllers/user.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, getUsers);
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/:id", getUserById);
router.patch("/:id", requireAuth, requireAdmin, updateUser);

module.exports = router;