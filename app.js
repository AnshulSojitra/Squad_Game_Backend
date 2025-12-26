const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

// Routes

const adminRoutes = require("./routes/adminRoutes");
const groundRoutes = require("./routes/groundRoutes");
const adminGroundRoutes = require("./routes/adminGroundRoutes");
const sequelize = require("./config/db");
const locationRoutes = require("./routes/locationRoutes");

sequelize
  .sync()
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.error(err));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running" });
});

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin/grounds", adminGroundRoutes);
app.use("/api/grounds", groundRoutes);
app.use("/api/location", locationRoutes);

module.exports = app;
