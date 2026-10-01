const express = require("express");
const cors = require("cors");
const trackRoutes = require("./routes/track.routes");
const bmiRoutes = require("./routes/bmi.routes");
const bmiRecommendationRoutes = require("./routes/bmiRecommendation.routes");
const userRoutes = require("./routes/user.routes");
const activityRoutes = require("./routes/activity.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const app = express();

// 1. Global middleware
app.use(cors());
app.use(express.json());

// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tracks", trackRoutes);
app.use("/api/bmi-records", bmiRoutes);
app.use("/api/bmi-recommendations", bmiRecommendationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);

// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;