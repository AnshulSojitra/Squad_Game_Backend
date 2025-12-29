const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const adminAuth = require("../middleware/authMiddleware");
const {
  createGround,
  updateGround,
  getAdminGrounds,
  deleteGround,
  getAdminGroundById,
  addGroundImages,
  deleteGroundImage,
} = require("../controllers/groundController");

router.post("/", adminAuth, upload.array("images", 5), createGround);
router.get("/", adminAuth, getAdminGrounds); // Get admin's grounds
router.delete("/:id", adminAuth, deleteGround); // Delete ground
router.put("/:id", adminAuth, upload.array("images", 5), updateGround); // Add update route
// router.get("/:id", adminAuth, getAdminGroundById); // Get single ground (admin)
router.post(
  "/admin/grounds/:id/images",
  adminAuth,
  upload.array("images", 5),
  addGroundImages
);

router.delete("/admin/grounds/images/:imageId", adminAuth, deleteGroundImage);

module.exports = router;
