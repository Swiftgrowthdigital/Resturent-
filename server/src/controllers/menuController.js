const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const Seat = require('../models/Seat');
const { applyRestaurantName } = require('../config/restaurant');

const getMenu = asyncHandler(async (_req, res) => {
  const [categories, foods, restaurant, seats] = await Promise.all([
    Category.find().sort({ sortOrder: 1, name: 1 }),
    Food.find().populate('category').sort({ createdAt: -1 }),
    Restaurant.findOne(),
    Seat.find({ active: true }).sort({ seatNumber: 1 }).select('seatNumber')
  ]);

  res.json({ restaurant: applyRestaurantName(restaurant), availableSeats: seats.map((seat) => seat.seatNumber), categories: categories.filter((category) => category.status !== false), foods: foods.filter((food) => food.available !== false && !food.outOfStock) });
});

const getFoodsByCategory = asyncHandler(async (req, res) => {
  const foods = await Food.find({ category: req.params.id }).populate('category').sort({ createdAt: -1 });
  res.json({ foods });
});

const searchMenu = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.json({ foods: [] });
  }

  const categories = await Category.find({
    name: { $regex: query, $options: 'i' }
  }).select('_id');
  const categoryIds = categories.map((category) => category._id);

  const foods = await Food.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : [])
    ]
  })
    .populate('category')
    .sort({ createdAt: -1 });

  res.json({ foods });
});

module.exports = { getMenu, getFoodsByCategory, searchMenu };
