const router = require('express').Router();
const { createOrder, listOrders, getOrder, updateOrderStatus, setStatus } = require('../controllers/orderController');
const { orderCreationLimiter } = require('../middlewares/rateLimitMiddleware');
const { param } = require('express-validator');
const { validateRequest } = require('../middlewares/validationMiddleware');

router.post('/', orderCreationLimiter, createOrder);
router.get('/', listOrders);
router.get('/:id', param('id').isMongoId(), validateRequest, getOrder);
router.patch('/:id/status', param('id').isMongoId(), validateRequest, updateOrderStatus);
router.patch('/:id/confirm', param('id').isMongoId(), validateRequest, setStatus('Confirmed'));
router.patch('/:id/cancel', param('id').isMongoId(), validateRequest, setStatus('Cancelled'));

module.exports = router;
