const router = require('express').Router();
const { getFoods, createFood, updateFood, deleteFood } = require('../controllers/foodController');
const { param } = require('express-validator');
const { validateRequest } = require('../middlewares/validationMiddleware');

router.get('/', getFoods);
router.post('/', createFood);
router.put('/:id', param('id').isMongoId(), validateRequest, updateFood);
router.delete('/:id', param('id').isMongoId(), validateRequest, deleteFood);

module.exports = router;
