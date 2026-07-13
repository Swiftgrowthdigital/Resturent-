const router = require('express').Router();
const { getMenu, getFoodsByCategory, searchMenu } = require('../controllers/menuController');

router.get('/', getMenu);
router.get('/category/:id', getFoodsByCategory);
router.get('/search', searchMenu);

module.exports = router;
