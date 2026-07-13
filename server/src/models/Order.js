const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    itemTotal: { type: Number, required: true },
    instructions: { type: String, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    clientOrderId: { type: String, required: true, unique: true },
    orderNumber: { type: String, required: true, unique: true },
    seatNumber: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending'
    },
    customerLocation: {
      latitude: Number,
      longitude: Number,
      distanceMeters: Number
    }
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
