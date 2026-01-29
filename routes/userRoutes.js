const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userAuth = require("../middleware/userAuthMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/me", userAuth, userController.getLoggedInUser);
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.put("/complete-profile", userAuth, userController.completeProfile);

module.exports = router;
