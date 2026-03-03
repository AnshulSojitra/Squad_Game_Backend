const { Review, Ground } = require("../models");

exports.addReview = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const ground = await Ground.findByPk(groundId);
    if (!ground || ground.isBlocked) {
      return res.status(404).json({ message: "Ground not found" });
    }

    // Prevent multiple reviews by same user
    const existingReview = await Review.findOne({
      where: { groundId, userId },
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this ground",
      });
    }

    const review = await Review.create({
      rating,
      comment,
      userId,
      groundId,
    });

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
};
