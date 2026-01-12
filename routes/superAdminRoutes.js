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
  getAllGrounds,
  toggleGroundBlock,
  getLoggedInSuperAdmin,
  getUserBookings,
  getAdminGrounds,
  getGroundBookings,
  createAdmin,
} = require("../controllers/superAdminController");
const { loginSuperAdmin } = require("../controllers/superAdminAuthController");

router.get("/me", superAdminAuth, getLoggedInSuperAdmin);
//LOGIN ROUTE
router.post("/login", loginSuperAdmin);

//USER ROUTES
router.get("/users", superAdminAuth, getAllUsers);
router.get("/user/:id", superAdminAuth, getUserById);
router.patch("/user/block/:id", superAdminAuth, toggleUserBlock);
router.get("/users/:userId/bookings", superAdminAuth, getUserBookings);

module.exports = router;

//ADMIN ROUTES
router.get("/admins", superAdminAuth, getAllAdmins);
router.get("/admin/:id", superAdminAuth, getAdminById);
router.patch("/admin/block/:id", superAdminAuth, toggleAdminBlock);
router.get("/admins/:adminId/grounds", superAdminAuth, getAdminGrounds);
router.post("/admins", superAdminAuth, createAdmin);

//GROUND ROUTES
router.get("/grounds", superAdminAuth, getAllGrounds);
router.patch("/ground/block/:id", superAdminAuth, toggleGroundBlock);
router.get("/grounds/:groundId/bookings", superAdminAuth, getGroundBookings);

//BOOKING ROUTE
router.get("/bookings", superAdminAuth, getAllBookings);
router.patch("/bookings/:id/cancel", superAdminAuth, cancelBooking);
router.patch("/bookings/:id/complete", superAdminAuth, completeBooking);

module.exports = router;
