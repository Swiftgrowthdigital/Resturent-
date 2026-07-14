const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const Food = require('../models/Food');
const Category = require('../models/Category');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { deletePublicStorageUrl } = require('../config/supabase');

const foodValidators = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 120 }),
  body('description').optional().isString().trim().isLength({ max: 1000 }),
  body('category').optional().isMongoId(),
  body('price').optional().isFloat({ min: 0, max: 100000 }).toFloat(),
  body('image').optional({ values: 'falsy' }).isURL(),
  body('veg').optional().isBoolean().toBoolean(),
  body('bestseller').optional().isBoolean().toBoolean(),
  body('todaysSpecial').optional().isBoolean().toBoolean(),
  body('combo').optional().isBoolean().toBoolean(),
  body('outOfStock').optional().isBoolean().toBoolean(),
  body('available').optional().isBoolean().toBoolean()
];

const getFoods = asyncHandler(async (_req, res) => {
  const foods = await Food.find().populate('category').sort({ createdAt: -1 });
  res.json({ foods });
});

const createFood = [
  body('name').isString().trim().isLength({ min: 2, max: 120 }),
  body('category').isMongoId(),
  body('price').isFloat({ min: 0, max: 100000 }).toFloat(),
  ...foodValidators.slice(1),
  validateRequest,
  asyncHandler(async (req, res) => {
    if (!(await Category.exists({ _id: req.body.category }))) return res.status(400).json({ message: 'Category not found' });

    const food = await Food.create({
      name: req.body.name,
      description: req.body.description || '',
      category: req.body.category,
      price: Number(req.body.price),
      image: req.body.image || '',
      veg: req.body.veg === 'true' || req.body.veg === true,
      bestseller: req.body.bestseller === 'true' || req.body.bestseller === true,
      todaysSpecial: req.body.todaysSpecial === 'true' || req.body.todaysSpecial === true,
      combo: req.body.combo === 'true' || req.body.combo === true,
      outOfStock: req.body.outOfStock === 'true' || req.body.outOfStock === true,
      available: req.body.available !== 'false' && req.body.available !== false
    });
    req.app.get('io')?.emit('menu:updated');
    res.status(201).json({ food });
  })
];

const updateFood = [
  ...foodValidators,
  validateRequest,
  asyncHandler(async (req, res) => {
  const allowedKeys = ['name', 'description', 'category', 'price', 'image', 'veg', 'bestseller', 'todaysSpecial', 'combo', 'outOfStock', 'available'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedKeys.includes(key)));
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid food fields supplied' });
  if (updates.category && !(await Category.exists({ _id: updates.category }))) return res.status(400).json({ message: 'Category not found' });
  const existing = await Food.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Food not found' });
  const food = await Food.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );
  if (updates.image && existing.image && updates.image !== existing.image) await deletePublicStorageUrl(existing.image);
  req.app.get('io')?.emit('menu:updated');
  res.json({ food });
})
];

const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findByIdAndDelete(req.params.id);
  if (!food) {
    return res.status(404).json({ message: 'Food not found' });
  }
  await deletePublicStorageUrl(food.image);
  req.app.get('io')?.emit('menu:updated');
  res.json({ message: 'Food deleted' });
});

module.exports = { getFoods, createFood, updateFood, deleteFood };
