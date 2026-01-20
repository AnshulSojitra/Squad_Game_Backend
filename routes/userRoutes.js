const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userAuth = require("../middleware/userAuthMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/me", userAuth, userController.getLoggedInUser);
router.put("/change-password", userAuth, userController.changePassword);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
