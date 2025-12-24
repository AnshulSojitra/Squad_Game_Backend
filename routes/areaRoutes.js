const express = require("express");
const router = express.Router();
const areaController = require("../controllers/areaController");

// Admin only
router.post("/", areaController.createArea);
router.get("/", areaController.getAreas);
router.put("/:id", areaController.updateArea);
router.delete("/:id", areaController.deleteArea);

module.exports = router;
