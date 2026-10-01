const User = require("../models/user.model");

const requireAuth = async (req, res, next) => {
  try {
    const userId = req.header("x-user-id");
    if (!userId) return res.status(401).json({ message: "Authentication required" });
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid user session" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

module.exports = { requireAuth, requireAdmin };