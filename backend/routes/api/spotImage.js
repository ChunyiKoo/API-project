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

//Delete a Spot Image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const imageId = parseInt(req.params.imageId);
  const theImage = await SpotImage.findByPk(imageId, {
    include: { model: Spot },
  });

  if (!theImage) {
    res.status(404);
    return res.json({
      message: "Spot Image couldn't be found",
      statusCode: 404,
    });
  }

  const ownerId = parseInt(theImage.Spot.ownerId);
  const { id } = req.user;
  const currentUser = parseInt(id);

  if (currentUser !== ownerId) {
    res.status(401);
    return res.json({
      message: "Not your spot. Please try other image numbers.",
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
