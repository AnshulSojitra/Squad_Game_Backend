const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

// Routes
const gameRoutes = require("./routes/gameRoutes");
const areaRoutes = require("./routes/areaRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running" });
});

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
