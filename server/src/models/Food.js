const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    veg: { type: Boolean, default: true },
    bestseller: { type: Boolean, default: false },
    todaysSpecial: { type: Boolean, default: false },
    combo: { type: Boolean, default: false },
    outOfStock: { type: Boolean, default: false },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
