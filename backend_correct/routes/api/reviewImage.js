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

//Delete a Review Image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const imageId = parseInt(req.params.imageId);
  const theImage = await ReviewImage.findByPk(imageId, {
    include: { model: Review },
  });

  if (!theImage) {
    res.status(404);
    return res.json({
      message: "Review Image couldn't be found",
      statusCode: 404,
    });
  }

  const userId = parseInt(theImage.Review.userId);
  const { id } = req.user;
  const currentUser = parseInt(id);

  if (currentUser !== userId) {
    res.status(401);
    return res.json({
      message: "Not your review. Please try other image numbers.",
      statusCode: 401,
    });
  }

  await theImage.destroy();
  res.status(200);
  return res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});

module.exports = router;
