const express = require("express");
const { Op } = require("sequelize");
const {
  Spot,
  User,
  SpotImage,
  Review,
  sequelize,
  ReviewImage,
  Booking,
} = require("../../db/models");
const { check, validationResult, query } = require("express-validator");
const { requireAuth } = require("../../utils/auth");
const { NUMBER, and } = require("sequelize");
const router = express.Router();

//handleValidationErrs middleware
const handleValidationErrs = (req, _res, next) => {
  let err = {};
  const validationErrors = validationResult(req);
  //validationResult(req) returns a Result object

  if (!validationErrors.isEmpty()) {
    //.isEmpty() Returns a boolean indicating whether this result object contains no errors at all.
    validationErrors.array().forEach((error) => {
      //.array() returns an array of validation errors
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
const createValidation = (errors, _req, res, _next) => {
  res.status(400);
  return res.json({
    message: "Validation Error",
    statusCode: 400,
    errors,
  });
};
//validateGetSpot express-validator
const validateGetSpot = [
  query("page")
    .optional({ nullable: true })
    .isInt({
      min: 1,
    })
    .withMessage("Page must be greater than or equal to 1"),
  query("size")
    .optional({ nullable: true })
    .isInt({
      min: 1,
    })
    .withMessage("Size must be greater than or equal to 1"),
  query("maxLat")
    .optional({ nullable: true })
    .isFloat({
      min: -90,
      max: 90,
    })
    .withMessage("Maximum latitude is invalid"),
  query("minLat")
    .optional({ nullable: true })
    .isFloat({
      min: -90,
      max: 90,
    })
    .withMessage("Minimum latitude is invalid"),
  query("minLng")
    .optional({ nullable: true })
    .isFloat({
      min: -180,
      max: 180,
    })
    .withMessage("Minimum longitude is invalid"),
  query("maxLng")
    .optional({ nullable: true })
    .isFloat({
      min: -180,
      max: 180,
    })
    .withMessage("Maximum longitude is invalid"),
  query("minPrice")
    .optional({ nullable: true })
    .isFloat({
      min: 0,
    })
    .withMessage("Minimum price must be greater than or equal to 0"),
  query("maxPrice")
    .optional({ nullable: true })
    .isFloat({
      min: 0,
    })
    .withMessage("Maximum price must be greater than or equal to 0"),

  handleValidationErrs, //handleValidationErrs middleware
  createValidation, //Validation Error formatter
];

//Get all Spots

router.get("/", validateGetSpot, async (req, res, next) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  //Validation Error Collector
  let valid = true;
  let validation_json = {
    message: "Validation Error",
    statusCode: 400,
    errors: {},
  };

  if (!page || parseInt(page) < 1 || parseInt(page) > 10) page = 1; //default
  if (!size || parseInt(size) < 1 || parseInt(size) > 20) size = 20; //default
  page = parseInt(page);
  size = parseInt(size);
  let pagination = {};
  pagination.offset = size * (page - 1);
  pagination.limit = size;

  if ((minLat !== null) & (maxLat !== null)) {
    if (parseFloat(minLat) > parseFloat(maxLat)) {
      valid = false;
      validation_json.errors.Latitude =
        "Maximum Latitude should be greater than Minimum Latitude";
    }
  }

  let where = {};
  if (!minLat & !maxLat) {
  } else if (!maxLat) {
    where.lat = { [Op.gte]: minLat };
  } else if (!minLat) {
    where.lat = { [Op.lte]: maxLat };
  } else {
    where.lat = { [Op.and]: { [Op.gte]: minLat, [Op.lte]: maxLat } };
  }

  if ((minLng !== null) & (maxLng !== null)) {
    if (parseFloat(minLng) > parseFloat(maxLng)) {
      valid = false;
      validation_json.errors.Longitude =
        "Maximum Longitude should be greater than Minimum Longitude";
    }
  }

  if (!minLng & !maxLng) {
  } else if (!maxLng) {
    where.lng = { [Op.gte]: minLng };
  } else if (!minLat) {
    where.lng = { [Op.lte]: maxLng };
  } else {
    where.lng = { [Op.and]: { [Op.gte]: minLng, [Op.lte]: maxLng } };
  }

  if ((minPrice !== null) & (maxPrice !== null)) {
    if (parseFloat(minPrice) > parseFloat(maxPrice)) {
      valid = false;
      validation_json.errors.Price =
        "Maximum Price should be greater than Minimum Price";
    }
  }

  if (!valid) {
    res.status(400);
    return res.json(validation_json);
  }

  if (!minPrice & !maxPrice) {
  } else if (!maxPrice) {
    where.price = { [Op.gte]: minPrice };
  } else if (!minPrice) {
    where.price = { [Op.lte]: maxPrice };
  } else {
    where.price = { [Op.and]: { [Op.gte]: minPrice, [Op.lte]: maxPrice } };
  }

  let allSpots = await Spot.findAll({
    include: [{ model: SpotImage }, { model: Review }],
    where,
    ...pagination,
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
    if (count !== 0) spot.avgRating = sum / count;
    else spot.avgRating = "Has not been rated yet";
    delete spot.Reviews;
  });

  Spots.forEach((spot) => {
    spot.SpotImages.forEach((SpotImage) => {
      if (SpotImage.preview == true) {
        //only show preview image
        spot.previewImage = SpotImage.url;
      }
    });
    if (!spot.previewImage) {
      spot.previewImage = " image coming soon";
    }
    delete spot.SpotImages;
  });

  res.status(200);
  return res.json({ Spots, page, size });
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
    if (count === 0) spot.avgRating = "Has not been rated yet";
    else spot.avgRating = sum / count;
    delete spot.Reviews;
  });

  Spots.forEach((spot) => {
    spot.SpotImages.forEach((SpotImage) => {
      if (SpotImage.preview == true) {
        //only show preview image
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

//Get all Reviews by a Spot's id

router.get("/:spotId/reviews", async (req, res, next) => {
  const { spotId } = req.params;
  let theSpot = await Spot.findByPk(parseInt(spotId));
  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }
  let where = {
    spotId,
  };
  const Reviews = await Review.findAll({
    where,
    include: [
      {
        model: User,
        required: true,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: ReviewImage,
        required: true,
        attributes: ["id", "url"],
      },
    ],
  });
  res.status(200);
  return res.json({ Reviews });
});

//validateCreateReview express-validator
const validateCreateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrs,
  //createValidation,
];

//*Create a Review for a Spot based on the Spot's id

router.post(
  "/:spotId/reviews",
  requireAuth,
  validateCreateReview,
  async (req, res, next) => {
    const spotId = parseInt(req.params.spotId);
    const { id } = req.user;
    const userId = parseInt(id);
    const { review, stars } = req.body;
    const theSpot = await Spot.findByPk(spotId);

    console.log({ spotId }, { userId });
    console.log(theSpot);

    if (!theSpot) {
      res.status(404);
      return res.json({
        message: "Spot couldn't be found",
        statusCode: 404,
      });
    }

    let where = {
      spotId,
      userId,
    };

    let theReview = await Review.findOne({ where });

    if (theReview) {
      res.status(403);
      return res.json({
        message: "User already has a review for this spot",
        statusCode: 403,
      });
    }

    const newReview = await Review.create({
      spotId,
      userId,
      review,
      stars,
    });
    res.status(201);
    return res.json(newReview);
  }
);

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
    theSpot.avgStarRating = sum / count;
    delete theSpot.Reviews;

    res.status(200);
    return res.json(theSpot);
  }
});

//validateCreateSpot express-validator
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
    .isFloat({
      min: -90,
      max: 90,
    })
    .withMessage("Latitude is not valid"),
  check("lng")
    .isFloat({
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
  //createValidation,
];

//Create a Spot owned by current User
router.post("/", validateCreateSpot, async (req, res, next) => {
  const { id } = req.user;
  const currentUser = parseInt(id);
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  // if (err) {
  //   res.status(400);
  //   return res.json({
  //     message: "Validation Error",
  //     statusCode: 400,
  //     errors,
  //   });
  // }
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

//*Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
  let { id } = req.user;
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const theSpot = await Spot.findByPk(parseInt(spotId));

  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  const ownerId = parseInt(theSpot.ownerId);
  if (ownerId !== id) {
    res.status(403);
    return res.json({
      message: "Only owner can add an image.",
      statusCode: 403,
    });
  }
  const newSpotImage = await SpotImage.create({
    url,
    preview,
    spotId,
  });

  id = newSpotImage.id;
  res.status(200);
  return res.json({ id, url, preview });
});

//Edit a Spot
router.put(
  "/:spotId",
  requireAuth,
  validateCreateSpot,
  async (req, res, next) => {
    const { spotId } = req.params;
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    const { id } = req.user;
    const currentUser = parseInt(id);
    const theSpot = await Spot.findByPk(parseInt(spotId));
    if (!theSpot) {
      res.status(404);
      return res.json({
        message: "Spot couldn't be found",
        statusCode: 404,
      });
    }

    if (currentUser !== parseInt(theSpot.ownerId)) {
      res.status(403);
      return res.json({
        message: "Only owner can edit the Spot.",
        statusCode: 403,
      });
    }

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
);

//Delete a Spot
router.delete("/:spotId", async (req, res, next) => {
  const { spotId } = req.params;

  const { id } = req.user;
  const currentUser = parseInt(id);

  const theSpot = await Spot.findByPk(parseInt(spotId));
  if (!theSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  if (currentUser !== parseInt(theSpot.ownerId)) {
    res.status(403);
    return res.json({
      message: "Only owner can delete the Spot.",
      statusCode: 403,
    });
  }
  theSpot.destroy();
  res.status(200);
  return res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});

//Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res, next) => {
  let { id } = req.user;
  const currentUser = parseInt(id);
  let { spotId } = req.params;
  spotId = parseInt(spotId);

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  const ownerId = spot.ownerId;

  if (currentUser === ownerId) {
    console.log("currentUser === ownerId");
    const Bookings = await Booking.findAll({
      where: { spotId },
      include: { model: User, attributes: ["id", "firstName", "lastName"] },
    });
    res.status(200);
    return res.json({ Bookings });
  } else {
    console.log("user is not owner");
    const Bookings = await Booking.findAll({
      attributes: ["spotId", "startDate", "endDate"],
      where: { spotId },
    });

    res.status(200);
    return res.json({ Bookings });
  }
});

//******Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res, next) => {
  let { id } = req.user;
  const currentUser = parseInt(id);
  let { spotId } = req.params;
  spotId = parseInt(spotId);

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  const startD = req.body.startDate;
  const endD = req.body.endDate;
  //user input start and end dates
  let start = new Date(new Date(startD).toDateString());
  let end = new Date(new Date(endD).toDateString());

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

  console.log({ start, end });

  const ownerId = parseInt(spot.ownerId);
  if (currentUser === ownerId) {
    res.status(403);
    return res.json({
      message: "Owner cannot make a booking.",
      statusCode: 403,
    });
  }
  console.log({ ownerId, spotId, currentUser });
  const allBookings = await Booking.findAll({
    where: { spotId },
  });

  //console.log({ allBookings });

  let isBooked = false;
  allBookings.forEach((booking) => {
    let { startDate, endDate } = booking.toJSON();
    // let bookStart = new Date(new Date(startDate).toDateString());
    // let bookEnd = new Date(new Date(endDate).toDateString());
    let bookStart = new Date(startDate);
    let bookEnd = new Date(endDate);
    //booking start and end dates in database

    if (bookEnd - end >= 0 && start - bookStart >= 0) {
      console.log(start, end, bookStart, bookEnd);
      isBooked = true;
      res.status(403);
      return res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }

    if (end - bookEnd >= 0 && bookStart - start >= 0) {
      console.log(start, end, bookStart, bookEnd);
      isBooked = true;
      res.status(403);
      return res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }

    if (bookEnd - start >= 0 && start - bookStart >= 0) {
      console.log(start, end, bookStart, bookEnd);
      isBooked = true;
      res.status(403);
      return res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "Start date conflicts with an existing booking",
        },
      });
    }

    if (bookEnd - end >= 0 && end - bookStart >= 0) {
      console.log(start, end, bookStart, bookEnd);
      isBooked = true;
      res.status(403);
      return res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          endDate: "End date conflicts with an existing booking",
        },
      });
    }
  });
  if (isBooked) return;
  const newBooking = await Booking.create({
    spotId,
    userId: currentUser,
    startDate: start,
    endDate: end,
  });
  res.status(200);
  return res.json(newBooking);
});

//Error handler to log errors
router.use((errors, _req, res, _next) => {
  res.status(400);
  return res.json({
    message: "Validation Error",
    statusCode: 400,
    errors,
  });
});

module.exports = router;
