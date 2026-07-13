const router = require('express').Router();
const { body } = require('express-validator');
const { login, logout, session } = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/login', loginLimiter, body('password').isString().isLength({ min: 1, max: 256 }), validateRequest, login);
router.post('/logout', protect, logout);
router.get('/session', protect, session);
module.exports = router;
