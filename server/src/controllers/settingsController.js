const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const Restaurant = require('../models/Restaurant');
const Seat = require('../models/Seat');
const { applyRestaurantName } = require('../config/restaurant');

function normalizeSeats(seats) {
  return [...new Set(seats.map((seat) => String(seat).trim()).filter(Boolean))];
}

const getSettings = asyncHandler(async (_req, res) => {
  const [restaurant, seats] = await Promise.all([Restaurant.findOne(), Seat.find().sort({ seatNumber: 1 })]);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json({ settings: { ...applyRestaurantName(restaurant), availableSeats: seats.filter((seat) => seat.active).map((seat) => seat.seatNumber) } });
});

const updateSettings = [
  body('availableSeats').isArray({ min: 1 }),
  body('availableSeats.*').isString().trim().isLength({ min: 1, max: 20 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid seat configuration', errors: errors.array() });

    const availableSeats = normalizeSeats(req.body.availableSeats);
    const restaurant = await Restaurant.findOne();
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    await Seat.deleteMany({});
    await Seat.insertMany(availableSeats.map((seatNumber) => ({ seatNumber, active: true })));
    res.json({ settings: { ...applyRestaurantName(restaurant), availableSeats } });
  })
];

module.exports = { getSettings, updateSettings };
