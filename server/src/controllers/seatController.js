const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const Seat = require('../models/Seat');
const { validateRequest } = require('../middlewares/validationMiddleware');

const normalized = (seatNumber) => String(seatNumber || '').trim().toUpperCase();
const validateSeat = [
  body('seatNumber').isString().trim().isLength({ min: 1, max: 20 }),
  asyncHandler(async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).json({ valid: false, message: 'A seat number is required.' });
    const seat = await Seat.findOne({ seatNumber: normalized(req.body.seatNumber), active: true });
    if (!seat) return res.status(404).json({ valid: false, message: 'Seat not found.' });
    res.json({ valid: true, seatNumber: seat.seatNumber });
  })
];

const notifyMenu = (req) => req.app.get('io')?.emit('menu:updated');
const listSeats = asyncHandler(async (_req, res) => res.json({ seats: await Seat.find().sort({ seatNumber: 1 }) }));
const createSeat = [body('seatNumber').isString().trim().isLength({ min: 1, max: 20 }), body('active').optional().isBoolean().toBoolean(), validateRequest, asyncHandler(async (req, res) => {
  const seat = await Seat.create({ seatNumber: normalized(req.body.seatNumber), active: req.body.active !== false });
  notifyMenu(req);
  res.status(201).json({ seat });
})];
const updateSeat = [
  body('seatNumber').optional().isString().trim().isLength({ min: 1, max: 20 }),
  body('active').optional().isBoolean().toBoolean(),
  validateRequest,
  asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.seatNumber !== undefined) updates.seatNumber = normalized(req.body.seatNumber);
  if (req.body.active !== undefined) updates.active = req.body.active === true || req.body.active === 'true';
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid seat fields supplied' });
  const seat = await Seat.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!seat) return res.status(404).json({ message: 'Seat not found' });
  notifyMenu(req);
  res.json({ seat });
})
];
const deleteSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findByIdAndDelete(req.params.id);
  if (!seat) return res.status(404).json({ message: 'Seat not found' });
  notifyMenu(req);
  res.json({ message: 'Seat deleted' });
});

module.exports = { validateSeat, listSeats, createSeat, updateSeat, deleteSeat };
