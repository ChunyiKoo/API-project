const express = require("express");
const {
  Spot,
  User,
  SpotImage,
  Review,
  sequelize,
  Booking,
} = require("../../db/models");
const { check, validationResult } = require("express-validator");
const { requireAuth } = require("../../utils/auth");
const { NUMBER } = require("sequelize");
const router = express.Router();

//Get all Spots

router.get("/", async (req, res, next) => {
  let allSpots = await Spot.findAll({
    include: [{ model: SpotImage }, { model: Review }],
  });
  let Spots = [];
  allSpots.forEach((spot) => {
    Spots.push(spot.toJSON());
  });

  Spots.forEach((spot) => {
    let count = 0;
    let sum = 0.0;
    spot.Reviews.forEach((Review) => {
      count++;
      sum += parseFloat(Review.stars);
      console.log(Review);
    });
    console.log({ count, sum });
    spot.avgRating = sum / count;
    delete spot.Reviews;
  });

  Spots.forEach((spot) => {
    spot.SpotImages.forEach((SpotImage) => {
      if (SpotImage.preview == true) {
        spot.previewImage = SpotImage.url;
      }
    });
    if (!spot.previewImage) {
      spot.previewImage = " image coming soon";
    }
    delete spot.SpotImages;
  });

  res.status(200);
  return res.json({ Spots });
});

//Get all Spots owned by the Current User
router.get("/current", requireAuth, async (req, res, next) => {
  const { id } = req.user;
  let where = {
    ownerId: id,
  };
  allSpots = await Spot.findAll({
    where,
    include: [{ model: SpotImage }, { model: Review }],
  });
  let Spots = [];
  allSpots.forEach((spot) => {
    Spots.push(spot.toJSON());
  });

  Spots.forEach((spot) => {
    let count = 0;
    let sum = 0.0;
    spot.Reviews.forEach((Review) => {
      count++;
      sum += parseFloat(Review.stars);
      console.log(Review);
    });
    console.log({ count, sum });
    spot.avgRating = sum / count;
    delete spot.Reviews;
  });

  Spots.forEach((spot) => {
    spot.SpotImages.forEach((SpotImage) => {
      if (SpotImage.preview == true) {
        spot.previewImage = SpotImage.url;
      }
    });
    if (!spot.previewImage) {
      spot.previewImage = " image coming soon";
    }
    delete spot.SpotImages;
  });

  res.status(200);
  return res.json({ Spots });
});

//Get details of a Spot from an id
router.get("/:spotId", async (req, res, next) => {
  const { spotId } = req.params;

  let theSpot = await Spot.findByPk(parseInt(spotId), {
    include: [
      { model: SpotImage },
      { model: Review },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });
  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  } else {
    theSpot = theSpot.toJSON();
    console.log(theSpot);
    let count = 0;
    let sum = 0.0;
    theSpot.Reviews.forEach((Review) => {
      count++;
      sum += parseFloat(Review.stars);
      //console.log(Review);
    });
    console.log({ count, sum });
    theSpot.numReviews = count;
    theSpot.avgRating = sum / count;
    delete theSpot.Reviews;

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
    ownerId: id,
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

//Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res, next) => {
  let { id } = req.user;
  const currentUser = parseInt(id);
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId, {
    include: {
      //attributes: ["id", "firstName", "lastName"],
      model: User,
      //include: { model: Booking },
    },
  });
  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  } else {
    spot.toJSON();
    const ownerId = spot.ownerId;
    if (currentUser === ownerId) {
      console.log("currentUser === spot.Users.id");
      let Bookings = [];
      spot.Users.forEach((user) => {
        user.toJSON();
        const { id, firstName, lastName } = user;
        const User = { id, firstName, lastName };
        Bookings.push({ User, ...user.Booking.toJSON() });
      });
      res.status(200);
      return res.json({ Bookings });
    } else {
      console.log("user is not owner");
      let Bookings = [];
      spot.Users.forEach((user) => {
        user.toJSON();
        const { spotId, startDate, endDate } = user.Booking.toJSON();
        Bookings.push({ spotId, startDate, endDate });
      });

      res.status(200);
      return res.json({ Bookings });
    }
  }
});

//Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res, next) => {
  let { id } = req.user;
  const currentUser = parseInt(id);
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId, {
    include: {
      //attributes: ["id", "firstName", "lastName"],
      model: User,
      //include: { model: Booking },
    },
  });

  const ownerId = parseInt(spot.ownerId);
  const { startDate, endDate } = req.body;
  let start = new Date(new Date(startDate).toDateString());
  let end = new Date(new Date(endDate).toDateString());
  let newBooking;
  if (end - start <= 0) {
    res.status(400);
    return res.json({
      message: "Validation error",
      statusCode: 400,
      errors: {
        endDate: "endDate cannot come before startDate",
      },
    });
  }
  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  } else {
    if (currentUser === ownerId) {
      res.status(403);
      return res.json({
        message: "Owner cannot make a booking.",
        statusCode: 403,
      });
    } else {
      console.log("user is not owner");
      let Bookings = [];
      spot.Users.forEach((user) => {
        user.toJSON();
        const { spotId, startDate, endDate } = user.Booking.toJSON();
        Bookings.push({ spotId, startDate, endDate });
        const bookStart = new Date(new Date(startDate).toDateString());
        const bookEnd = new Date(new Date(endDate).toDateString());
        if (bookEnd - start >= 0 && start - bookStart >= 0) {
          res.status(403);
          return res.json({
            message:
              "Sorry, this spot is already booked for the specified dates",
            statusCode: 403,
            errors: {
              startDate: "Start date conflicts with an existing booking",
            },
          });
        }
        if (bookEnd - end >= 0 && end - bookStart >= 0) {
          res.status(403);
          return res.json({
            message:
              "Sorry, this spot is already booked for the specified dates",
            statusCode: 403,
            errors: {
              endDate: "End date conflicts with an existing booking",
            },
          });
        }
      });

      newBooking = await Booking.create({
        spotId,
        userId: currentUser,
        startDate: start,
        endDate: end,
      });
      res.status(200);
      return res.json(newBooking);
    }
  }

  // const newBooking = await Booking.create({
  //   spotId,
  // });
});

module.exports = router;
