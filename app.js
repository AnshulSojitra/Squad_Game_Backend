const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const fs = require("fs");
const path = require("path");

// Routes

const superAdminRoutes = require("./routes/superAdminRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminGroundRoutes = require("./routes/adminGroundRoutes");
const sequelize = require("./config/db");
const locationRoutes = require("./routes/locationRoutes");
const publicGroundRoutes = require("./routes/publicGroundRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const gameRoutes = require("./routes/gameRoutes");
const autoCompleteBookings = require("./cron/autoCompleteBookings");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 uploads folder created");
}

const app = express();

autoCompleteBookings();
// Middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use("/api", reviewRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api", gameRoutes);

module.exports = app;
