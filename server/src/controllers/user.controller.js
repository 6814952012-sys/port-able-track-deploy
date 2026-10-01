const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const publicUser = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;
  return data;
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Username, email and password are required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    const user = await User.create({ username, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json(publicUser(user));
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Username or email is already in use" });
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const allowed = {};
    if (typeof req.body.username === "string" && req.body.username.trim()) allowed.username = req.body.username.trim();
    if (typeof req.body.email === "string" && req.body.email.trim()) allowed.email = req.body.email.trim();
    if (req.body.role === "user" || req.body.role === "admin") allowed.role = req.body.role;
    if (req.body.password) {
      if (req.body.password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
      allowed.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Username or email is already in use" });
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, loginUser, updateUser };