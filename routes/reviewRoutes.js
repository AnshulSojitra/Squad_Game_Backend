const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/userAuthMiddleware");
const reviewController = require("../controllers/reviewController");

router.post("/grounds/:groundId/reviews", userAuth, reviewController.addReview);

module.exports = router;
