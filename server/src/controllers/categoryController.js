const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');
const Food = require('../models/Food');
const { validateRequest } = require('../middlewares/validationMiddleware');

const categoryValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }),
  body('icon').optional({ values: 'falsy' }).isString().trim().isLength({ max: 40 }),
  body('image').optional({ values: 'falsy' }).isURL(),
  body('sortOrder').optional().isInt({ min: 0, max: 10000 }).toInt(),
  body('status').optional().isBoolean().toBoolean()
];

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
  res.json({ categories });
});

const createCategory = [
  ...categoryValidators,
  validateRequest,
  asyncHandler(async (req, res) => {
    const category = await Category.create({
      name: req.body.name,
      icon: req.body.icon || '', image: req.body.image || '', sortOrder: Number(req.body.sortOrder || 0), status: req.body.status !== false
    });
    req.app.get('io')?.emit('menu:updated');
    res.status(201).json({ category });
  })
];

const updateCategory = [
  ...categoryValidators,
  validateRequest,
  asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, icon: req.body.icon || '', image: req.body.image || '', sortOrder: Number(req.body.sortOrder || 0), status: req.body.status !== false },
    { new: true, runValidators: true }
  );
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  req.app.get('io')?.emit('menu:updated');
  res.json({ category });
})
];

const deleteCategory = asyncHandler(async (req, res) => {
  const assignedFoods = await Food.countDocuments({ category: req.params.id });
  if (assignedFoods > 0) {
    return res.status(400).json({
      message: 'This category contains menu items. Delete those items first.'
    });
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  req.app.get('io')?.emit('menu:updated');
  res.json({ message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
