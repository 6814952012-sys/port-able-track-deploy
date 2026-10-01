const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const mongoose = require("mongoose");

// Cache the connection so serverless invocations (Vercel) reuse it
// instead of opening a new connection on every request.
const cached =
  global._mongooseCache ||
  (global._mongooseCache = {
    conn: null,
    promise: null,
  });

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;