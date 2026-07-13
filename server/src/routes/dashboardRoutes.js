const router = require('express').Router();
const { getDashboard } = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', protect, adminOnly, getDashboard);

module.exports = router;
