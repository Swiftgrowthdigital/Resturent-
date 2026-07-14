const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Counter = require('../models/Counter');
const { getRestaurantName, getRestaurantCurrency } = require('./restaurant');

// Production must never seed menu, seat, or order data. The dashboard owns
// those records; this only creates the minimal configuration records required
// for a newly provisioned, otherwise empty database.
async function initializeDatabase() {
  await Restaurant.findOneAndUpdate(
    {},
    { $setOnInsert: { name: getRestaurantName(), currency: getRestaurantCurrency(), status: 'open' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await Counter.findOneAndUpdate(
    { key: 'orderNumber' },
    { $setOnInsert: { value: 1000 + (await Order.countDocuments()) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.db.admin().ping();
  await initializeDatabase();
  console.log('MongoDB connected and verified');
}

module.exports = { connectDatabase };
