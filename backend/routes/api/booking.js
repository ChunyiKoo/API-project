const express = require("express");
const { Booking, User, Spot, SpotImage } = require("../../db/models");
const { check, validationResult } = require("express-validator");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

//Get all of the Current User's Bookings

router.get("/current", requireAuth, async (req, res, next) => {
  const { id } = req.user;
  let where = {
    userId: id,
  };
  const allBookings = await Booking.findAll({
    attributes: [
      "id",
      "spotId",
      "userId",
      "startDate",
      "endDate",
      "createdAt",
      "updatedAt",
    ],
    where,
    include: [{ model: Spot, include: SpotImage }],
  });
  let Bookings = [];
  allBookings.forEach((Booking) => {
    Bookings.push(Booking.toJSON());
  });
  console.log(allBookings);
  Bookings.forEach((Booking) => {
    Booking.Spot.SpotImages.forEach((SpotImage) => {
      if (SpotImage.preview == true) {
        Booking.Spot.previewImage = SpotImage.url;
      }
    });
    if (!Booking.Spot.previewImage) {
      Booking.Spot.previewImage = " image coming soon";
    }
    delete Booking.Spot.SpotImages;
  });

  res.status(200);
  return res.json({ Bookings });
});

//Edit a Booking
router.put("/:bookingId", requireAuth, async (req, res, next) => {
  let { id } = req.user;
  const currentUser = parseInt(id);
  const { bookingId } = req.params;
  console.log({ bookingId });
  const theBooking = await Booking.findByPk(parseInt(bookingId));
  if (!theBooking) {
    res.status(404);
    return res.json({
      message: "Booking couldn't be found",
      statusCode: 404,
    });
  }
  console.log(theBooking, { currentUser });

  const userId = parseInt(theBooking.userId);
  const spotId = parseInt(theBooking.spotId);

  if (currentUser !== userId) {
    res.status(401);
    return res.json({
      message: "Not your booking. Please try other booking numbers.",
      statusCode: 401,
    });
  }

  let { startDate, endDate } = req.body;
  let start = new Date(new Date(startDate).toDateString());
  let end = new Date(new Date(endDate).toDateString());
  let bookStart = new Date(new Date(theBooking.startDate).toDateString());
  let bookEnd = new Date(new Date(theBooking.startDate).toDateString());
  let today = new Date(new Date(Date.now()).toDateString());

  if (today - bookEnd > 0) {
    res.status(403);
    return res.json({
      message: "Past bookings can't be modified",
      statusCode: 403,
    });
  }

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
  if (bookEnd - start >= 0 && start - bookStart >= 0) {
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
    res.status(403);
    return res.json({
      message: "Sorry, this spot is already booked for the specified dates",
      statusCode: 403,
      errors: {
        endDate: "End date conflicts with an existing booking",
      },
    });
  }
  const newBooking = await Booking.create({
    spotId,
    userId: currentUser,
    startDate: start,
    endDate: end,
  });
  res.status(200);
  return res.json(newBooking);
});

//Delete a Booking
router.delete("/:bookingId", requireAuth, async (req, res, next) => {
  let { id } = req.user;
  const currentUser = parseInt(id);
  const { bookingId } = req.params;
  console.log({ bookingId });
  const theBooking = await Booking.findByPk(parseInt(bookingId));
  if (!theBooking) {
    res.status(404);
    return res.json({
      message: "Booking couldn't be found",
      statusCode: 404,
    });
  }
  //console.log(theBooking, { currentUser });

  const userId = parseInt(theBooking.userId);
  const spotId = parseInt(theBooking.spotId);
  const theSpot = await Spot.findByPk(parseInt(spotId));
  const ownerId = parseInt(theSpot.ownerId);

  if (currentUser !== userId && currentUser !== ownerId) {
    res.status(401);
    return res.json({
      message: "Please try other booking numbers.",
      statusCode: 401,
    });
  }

  let bookStart = new Date(new Date(theBooking.startDate).toDateString());
  let today = new Date(new Date("2021-11-18").toDateString());
  //let today = new Date(new Date(Date.now()).toDateString());
  console.log(today - bookStart, { today }, { bookStart });
  if (today - bookStart < 0) {
    res.status(403);
    return res.json({
      message: "Bookings that have been started can't be deleted",
      statusCode: 403,
    });
  }

  await theBooking.destroy();

  res.status(200);
  return res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});
module.exports = router;
