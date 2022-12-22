const express = require("express");
const { Spot, User, Review, SpotImage } = require("../../db/models");
const { check, validationResult } = require("express-validator");
const router = express.Router();
//Get all Reviews of the Current User
router.get("/current", async (req, res, next) => {
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
          exclude: ["description", "firstName", "lastName"],
        },
        include: {
          model: SpotImage,
          attritutes: [["url", "previewImage"]],
        },
      },
    ],
  });
  res.status(200);
  return res.json({ Reviews: allReviews });
});

module.exports = router;
