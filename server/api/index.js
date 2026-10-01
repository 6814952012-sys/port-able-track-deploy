// Vercel serverless entry point: wraps the Express app.
const app = require("../src/app");
const connectDB = require("../src/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return res.status(500).json({ message: "Database connection failed" });
  }
  return app(req, res);
};
