const express = require("express");
const {
  Spot,
  User,
  Review,
  SpotImage,
  ReviewImage,
} = require("../../db/models");
const { check, validationResult } = require("express-validator");
const { requireAuth } = require("../../utils/auth");
const router = express.Router();
//Get all Reviews of the Current User
router.get("/current", requireAuth, async (req, res, next) => {
  const { id } = req.user;
  let where = {
    userId: id,
  };
  const allReviews = await Review.findAll({
    where,
    include: [
      {
        model: User,
        required: true,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        required: true,
        attributes: {
          exclude: [
            "description",
            "firstName",
            "lastName",
            "createdAt",
            "updatedAt",
          ],
        },
        include: {
          model: SpotImage,
        },
      },
      {
        model: ReviewImage,
        required: true,
        attributes: ["id", "url"],
      },
    ],
  });

  let reviewList = [];
  allReviews.forEach((review) => {
    reviewList.push(review.toJSON());
  });
  console.log(reviewList);
  reviewList.forEach((review) => {
    review.Spot.SpotImages.forEach((SpotImage) => {
      if (SpotImage.preview == true) {
        review.Spot.previewImage = SpotImage.url;
      }
    });
    if (!review.Spot.previewImage)
      review.Spot.previewImage = " image coming soon";
    delete review.Spot.SpotImages;
  });
  res.status(200);
  return res.json({ Reviews: reviewList });
});

//Get all Reviews by a Spot's id

module.exports = router;
