const router = require('express').Router();
const { validateSeat, listSeats, createSeat, updateSeat, deleteSeat } = require('../controllers/seatController');
const { seatValidationLimiter } = require('../middlewares/rateLimitMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { param } = require('express-validator');
const { validateRequest } = require('../middlewares/validationMiddleware');

router.post('/validate', seatValidationLimiter, validateSeat);
router.get('/', protect, listSeats);
router.post('/', protect, createSeat);
router.put('/:id', protect, param('id').isMongoId(), validateRequest, updateSeat);
router.delete('/:id', protect, param('id').isMongoId(), validateRequest, deleteSeat);
module.exports = router;
