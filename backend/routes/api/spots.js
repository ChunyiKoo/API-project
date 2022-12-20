const express = require("express");
const { Spot } = require("../../db/models");

const router = express.Router();

//Get all Spots without "avgRating" and "previewImage"

router.get("/", async (req, res, next) => {
  let allSpots = {};
  allSpots.Spots = await Spot.findAll();
  res.status(200);
  res.json(allSpots);
});

module.exports = router;
