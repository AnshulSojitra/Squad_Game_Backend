// routes/superAdminRoutes.js
const express = require("express");
const router = express.Router();
const superAdminAuth = require("../middleware/superAdminAuth");

const {
  getAllUsers,
  getAllAdmins,
  getUserById,
  getAdminById,
  toggleUserBlock,
  toggleAdminBlock,
  getAllBookings,
  cancelBooking,
  completeBooking,
} = require("../controllers/superAdminController");
const { loginSuperAdmin } = require("../controllers/superAdminAuthController");

//LOGIN ROUTE
router.post("/login", loginSuperAdmin);

//USER ROUTES
router.get("/users", superAdminAuth, getAllUsers);
router.get("/user/:id", superAdminAuth, getUserById);
router.patch("/user/block/:id", superAdminAuth, toggleUserBlock);

//ADMIN ROUTES
router.get("/admins", superAdminAuth, getAllAdmins);
router.get("/admin/:id", superAdminAuth, getAdminById);
router.patch("/admin/block/:id", superAdminAuth, toggleAdminBlock);

//BOOKING ROUTE
router.get("/bookings", superAdminAuth, getAllBookings);
router.patch("/bookings/:id/cancel", superAdminAuth, cancelBooking);
router.patch("/bookings/:id/complete", superAdminAuth, completeBooking);

module.exports = router;
