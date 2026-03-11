const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const groundController = require("../controllers/groundController");
const superAdminController = require("../controllers/superAdminController");

//Create new ground

router.post(
  "/",
  adminAuth,
  upload.array("images", 5),
  groundController.createGround,
);

// Get all grounds of logged-in admin

router.get("/", adminAuth, groundController.getAdminGrounds);

//Get single ground by id

router.get("/:id", adminAuth, groundController.getAdminGroundById);

//Update ground

router.put(
  "/:id",
  adminAuth,
  upload.array("images", 5),
  groundController.updateGround,
);

//Delete ground

router.delete("/:id", adminAuth, groundController.deleteGround);

// Block/unblock ground

router.patch("/block/:id", adminAuth, superAdminController.toggleGroundBlock);

module.exports = router;
