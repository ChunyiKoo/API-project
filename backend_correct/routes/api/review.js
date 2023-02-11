const express = require("express");
const {
  Spot,
  User,
  Review,
  SpotImage,
  ReviewImage,
  sequelize,
} = require("../../db/models");
const { check, validationResult } = require("express-validator");
const { requireAuth } = require("../../utils/auth");
const router = express.Router();

//handleValidationErrs middleware
const handleValidationErrs = (req, _res, next) => {
  let err = {};
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    validationErrors.array().forEach((error) => {
      err[error.param] = error.msg;
    });

    // const err = Error("Validation Error");
    // err.errors = errors;
    // err.status = 400;
    // err.title = "Validation Error";
    next(err);
  }
  next();
};

//Validation Error formatter
// const createValidation = (errors, _req, res, _next) => {
//   res.status(400);
//   res.json({
//     message: "Validation Error",
//     statusCode: 400,
//     errors,
//   });
// };

//Add an Image to a Review based on the Review's id
router.post("/:reviewId/images", requireAuth, async (req, res, next) => {
  const reviewId = parseInt(req.params.reviewId);
  console.log(isNaN(reviewId), reviewId);
  let { url } = req.body;
  const theReview = await Review.findByPk(reviewId);
  if (!theReview) {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
      statusCode: 404,
    });
  }

  const currentUser = parseInt(req.user.id);
  const userId = parseInt(theReview.userId);

  console.log({ currentUser }, { userId });

  if (currentUser !== userId) {
    res.status(401);
    return res.json({
      message: "Not your review. Please try other review numbers.",
      statusCode: 401,
    });
  }

  let where = {
    reviewId,
  };

  const nReviewImages = await ReviewImage.count({ where });
  console.log("ABC", nReviewImages);

  // const nReviewImages = await ReviewImage.findOne({
  //   attributes: {
  //     include: [[sequelize.fn("COUNT", sequelize.col("id")), "numReviews"]],
  //   },
  //   where,
  // });
  // nReviewImages.toJSON();
  // console.log(nReviewImages);
  if (parseInt(nReviewImages) >= 10) {
    res.status(403);
    return res.json({
      message: "Maximum number of images for this resource was reached",
      statusCode: 403,
    });
  }

  const newReviewImage = await ReviewImage.create({
    url,
    reviewId,
  });

  let id = newReviewImage.id;
  url = newReviewImage.url;

  res.status(200);
  return res.json({ id, url });
});

const validateCreateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrs,
];
//Edit a Review
router.put(
  "/:reviewId",
  requireAuth,
  validateCreateReview,
  async (req, res, next) => {
    const reviewId = parseInt(req.params.reviewId);
    const theReview = await Review.findByPk(reviewId);

    if (!theReview) {
      res.status(404);
      return res.json({
        message: "Review couldn't be found",
        statusCode: 404,
      });
    }

    const userId = parseInt(theReview.userId);
    let { review, stars } = req.body;
    const { id } = req.user;
    const currentUser = parseInt(id);

    if (currentUser !== userId) {
      res.status(401);
      return res.json({
        message: "Not your review. Please try other review numbers.",
        statusCode: 401,
      });
    }

    theReview.set({ review, stars });
    await theReview.save();

    res.status(200);
    return res.json(theReview);
  }
);

//Delete a Review
router.delete("/:reviewId", requireAuth, async (req, res, next) => {
  const reviewId = parseInt(req.params.reviewId);
  const theReview = await Review.findByPk(reviewId);

  if (!theReview) {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
      statusCode: 404,
    });
  }

  const userId = parseInt(theReview.userId);
  const { id } = req.user;
  const currentUser = parseInt(id);

  if (currentUser !== userId) {
    res.status(401);
    return res.json({
      message: "Not your review. Please try other review numbers.",
      statusCode: 401,
    });
  }

  await theReview.destroy();
  res.status(200);
  return res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});

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

// Error handler to log errors
router.use((errors, _req, res, _next) => {
  res.status(400);
  return res.json({
    message: "Validation Error",
    statusCode: 400,
    errors,
  });
});

module.exports = router;
