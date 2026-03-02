const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/authMiddleware");

router.post("/login", adminController.loginAdmin);

router.get("/me", adminAuth, adminController.getLoggedInAdmin);

router.get("/dashboard", adminAuth, adminController.getAdminDashboard);

router.get("/charts/bookings", adminAuth, adminController.getBookingChart);

router.get("/charts/revenue", adminAuth, adminController.getRevenueChart);

router.get("/charts/grounds", adminAuth, adminController.getGroundBreakdown);

router.put("/change-password", adminAuth, adminController.changePassword);

router.post("/forgot-password", adminController.forgotPassword);

router.post("/reset-password", adminController.resetPassword);

router.post("/renew-subscription/:adminId", adminController.renewSubscription);

module.exports = router;
