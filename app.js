const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const fs = require("fs");
const path = require("path");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 uploads folder created");
}

// Routes

const superAdminRoutes = require("./routes/superAdminRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminGroundRoutes = require("./routes/adminGroundRoutes");
const sequelize = require("./config/db");
const locationRoutes = require("./routes/locationRoutes");
const publicGroundRoutes = require("./routes/publicGroundRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");

sequelize
  .sync()
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.error(err));

const app = express();

// Middleware

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "🗿🗿Welcome to Box Arena API🗿🗿" });
});

// API routes
app.use("/api/super-admin", superAdminRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/grounds", adminGroundRoutes);

app.use("/api/user", userRoutes);

app.use("/api/grounds", publicGroundRoutes);
app.use("/api/location", locationRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/admin/bookings", adminBookingRoutes);

module.exports = app;
