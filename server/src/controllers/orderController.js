const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Seat = require('../models/Seat');
const Counter = require('../models/Counter');
const { validateRequest } = require('../middlewares/validationMiddleware');

const createOrder = [
  body('clientOrderId').optional().isString().isLength({ min: 10, max: 100 }),
  body('seatNumber').isString().notEmpty(),
  body('items').isArray({ min: 1 }),
  body('items.*.foodId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1, max: 50 }),
  body('items.*.instructions').optional().isString().trim().isLength({ max: 300 }),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { seatNumber, items } = req.body;
    const clientOrderId = req.body.clientOrderId || `server-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const existing = await Order.findOne({ clientOrderId });
    if (existing) {
      return res.status(200).json({ order: existing, duplicated: true });
    }

    const normalizedSeat = String(seatNumber).trim().toUpperCase();
    const configuredSeat = await Seat.findOne({ seatNumber: normalizedSeat, active: true });
    if (!configuredSeat) {
      return res.status(400).json({ message: 'Seat not found. Please enter a valid seat number.' });
    }

    const foodIds = items.map((item) => item.foodId);
    const foods = await Food.find({ _id: { $in: foodIds } });
    const foodMap = new Map(foods.map((food) => [String(food._id), food]));

    const normalizedItems = items.map((item) => {
      const food = foodMap.get(String(item.foodId));
      if (!food) {
        throw Object.assign(new Error('Food item not found'), { statusCode: 400 });
      }
      if (food.outOfStock || food.available === false) {
        throw Object.assign(new Error(`${food.name} is out of stock`), { statusCode: 400 });
      }
      return {
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: Number(item.quantity),
        itemTotal: food.price * Number(item.quantity),
        instructions: String(item.instructions || '').trim().slice(0, 300)
      };
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = subtotal;
    const counter = await Counter.findOneAndUpdate(
      { key: 'orderNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const orderNumber = `${process.env.ORDER_PREFIX}${counter.value}`;

    const order = await Order.create({
      clientOrderId,
      orderNumber,
      seatNumber: configuredSeat.seatNumber,
      items: normalizedItems,
      subtotal,
      totalAmount,
      grandTotal: totalAmount,
      status: 'Pending',
    });

    const populated = await Order.findById(order._id).populate('items.food');
    const io = req.app.get('io');
    io.to('dashboard').emit('new-order', populated);
    io.to('dashboard').emit('order:new', populated); // compatibility with the existing dashboard

    res.status(201).json({
      success: true,
      message: 'Order successfully placed. Thank you.',
      orderNumber: order.orderNumber,
      seatNumber: order.seatNumber,
      grandTotal: order.grandTotal,
      estimatedPreparationTime: '20-30 minutes',
      order: populated
    });
  })
];

const listOrders = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const filter = { createdAt: { $gte: startOfToday } };
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('items.food');
  res.json({ orders });
});

const updateOrderStatus = [
  body('status').isIn(['Pending', 'Confirmed', 'Cancelled']),
  validateRequest,
  asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'Confirmed', 'Cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('items.food');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const io = req.app.get('io');
  io.to('dashboard').emit('order:updated', order);
  io.emit(`order:${order.orderNumber}`, order);

  res.json({ order });
})
];

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.food');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});

const setStatus = (status) => (req, res, next) => {
  req.body.status = status;
  return updateOrderStatus[1](req, res, () => updateOrderStatus[2](req, res, next));
};

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus, setStatus };
