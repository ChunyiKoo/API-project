const express = require("express");
const { Spot, User, SpotImage } = require("../../db/models");
const { check, validationResult } = require("express-validator");
const { requireAuth } = require("../../utils/auth");
const router = express.Router();

//Get all Spots without "avgRating" and "previewImage"

router.get("/", async (req, res, next) => {
  let allSpots = {};
  allSpots.Spots = await Spot.findAll();
  res.status(200);
  return res.json(allSpots);
});

//Get all Spots owned by the Current User without "avgRating" and "previewImage"
router.get("/current", requireAuth, async (req, res, next) => {
  const { id } = req.user;
  let allSpots = {};
  let where = {
    ownerId: id,
  };
  allSpots.Spots = await Spot.findAll({ where });
  res.status(200);
  return res.json(allSpots);
});

//Get details of a Spot from an id without "numReviews","avgRating" and "numReviews"
router.get("/:spotId", async (req, res, next) => {
  const { spotId } = req.params;

  const theSpot = await Spot.findByPk(parseInt(spotId));
  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  } else {
    res.status(200);
    return res.json(theSpot);
  }
});
//
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
const createSpotValidation = (errors, _req, res, _next) => {
  res.status(400);
  res.json({
    message: "Validation Error",
    statusCode: 400,
    errors,
  });
};

// ...
const validateCreateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required."),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("name")
    .isLength({
      min: 1,
      max: 49,
    })
    .withMessage("Name must be less than 50 characters"),
  check("lat")
    .isDecimal({
      min: -90,
      max: 90,
    })
    .withMessage("Latitude is not valid"),
  check("lng")
    .isDecimal({
      min: -180,
      max: 180,
    })
    .withMessage("Longitude is not valid"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .withMessage("price per day is required"),
  handleValidationErrs,
  createSpotValidation,
];

//Create a Spot owned by current User
router.post("/", validateCreateSpot, async (req, res, next) => {
  const { id } = req.user;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  const newSpot = await Spot.create({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
    ownerId: id,
  });

  res.status(201);
  return res.json(newSpot);
});

//Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", async (req, res, next) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const theSpot = await Spot.findByPk(parseInt(spotId));

  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  } else {
    const newSpotImage = await SpotImage.create({
      url,
      preview,
      spotId,
    });
    const { id } = newSpotImage;
    res.status(200);
    return res.json({ id, url, preview });
  }
});

//Edit a Spot
router.put("/:spotId", validateCreateSpot, async (req, res, next) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const theSpot = await Spot.findByPk(parseInt(spotId));
  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  } else {
    theSpot.set({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
    await theSpot.save();

    //theSpot = await Spot.findByPk(parseInt(spotId));
    res.status(200);
    return res.json(theSpot);
  }
});

//Delete a Spot
router.delete("/:spotId", async (req, res, next) => {
  const { spotId } = req.params;

  const theSpot = await Spot.findByPk(parseInt(spotId));
  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  } else {
    theSpot.destroy();
    res.status(200);
    return res.json({
      message: "Successfully deleted",
      statusCode: 200,
    });
  }
});
module.exports = router;
