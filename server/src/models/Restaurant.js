const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    openTime: { type: String, default: '10:00' },
    closeTime: { type: String, default: '22:00' },
    currency: { type: String, required: true },
    gstNumber: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
