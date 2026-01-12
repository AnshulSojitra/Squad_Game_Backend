const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/authMiddleware");

router.post("/login", adminController.loginAdmin);

router.get("/me", adminAuth, adminController.getLoggedInAdmin);

router.get("/revenue", adminAuth, adminController.getAdminRevenue);

module.exports = router;
