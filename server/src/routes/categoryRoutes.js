const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { param } = require('express-validator');
const { validateRequest } = require('../middlewares/validationMiddleware');

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', param('id').isMongoId(), validateRequest, updateCategory);
router.delete('/:id', param('id').isMongoId(), validateRequest, deleteCategory);

module.exports = router;
