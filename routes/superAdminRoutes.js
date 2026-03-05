const express = require("express");
const router = express.Router();
const superAdminAuth = require("../middleware/superAdminAuth");

const superAdminController = require("../controllers/superAdminController");
const { loginSuperAdmin } = require("../controllers/superAdminAuthController");
const gameController = require("../controllers/gameController");

router.get("/me", superAdminAuth, superAdminController.getLoggedInSuperAdmin);
//LOGIN ROUTE
router.post("/login", loginSuperAdmin);

//USER ROUTES
router.get("/users", superAdminAuth, superAdminController.getAllUsers);
router.get("/user/:id", superAdminAuth, superAdminController.getUserById);
router.patch(
  "/user/block/:id",
  superAdminAuth,
  superAdminController.toggleUserBlock,
);
router.get(
  "/users/:userId/bookings",
  superAdminAuth,
  superAdminController.getUserBookings,
);
router.delete("/user/:id", superAdminAuth, superAdminController.deleteUser);

module.exports = router;

//ADMIN ROUTES
router.get("/admins", superAdminAuth, superAdminController.getAllAdmins);
router.get("/admin/:id", superAdminAuth, superAdminController.getAdminById);
router.patch(
  "/admin/block/:id",
  superAdminAuth,
  superAdminController.toggleAdminBlock,
);
router.get(
  "/admins/:adminId/grounds",
  superAdminAuth,
  superAdminController.getAdminGrounds,
);
router.post("/admins", superAdminAuth, superAdminController.createAdmin);
router.delete("/admin/:id", superAdminAuth, superAdminController.deleteAdmin);

//GROUND ROUTES
router.get("/grounds", superAdminAuth, superAdminController.getAllGrounds);
router.patch(
  "/ground/block/:id",
  superAdminAuth,
  superAdminController.toggleGroundBlock,
);
router.get(
  "/grounds/:groundId/bookings",
  superAdminAuth,
  superAdminController.getGroundBookings,
);
router.delete("/ground/:id", superAdminAuth, superAdminController.deleteGround);

//BOOKING ROUTE
router.get("/bookings", superAdminAuth, superAdminController.getAllBookings);
router.patch(
  "/bookings/:id/cancel",
  superAdminAuth,
  superAdminController.cancelBooking,
);
router.patch(
  "/bookings/:id/complete",
  superAdminAuth,
  superAdminController.completeBooking,
);

//DASHBOARD ROUTE
router.get(
  "/dashboard",
  superAdminAuth,
  superAdminController.getSuperAdminDashboard,
);

router.get("/games", superAdminAuth, gameController.getAllGamesBySuperAdmin);
router.delete(
  "/games/:gameId",
  superAdminAuth,
  gameController.deleteGameBySuperAdmin,
);
router.delete(
  "/games/:gameId/participants/:userId",
  superAdminAuth,
  gameController.removeParticipantBySuperAdmin,
);

module.exports = router;
