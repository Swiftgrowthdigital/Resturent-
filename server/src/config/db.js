const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Counter = require('../models/Counter');
const { getRestaurantName, getRestaurantCurrency } = require('./restaurant');

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 30;

async function ensureOrderTtlIndex() {
  let indexes = [];
  try {
    indexes = await Order.collection.indexes();
  } catch (error) {
    // A brand-new deployment may not have an orders collection yet. Creating
    // the index below also creates the collection in that case.
    if (error.code !== 26) throw error;
  }
  const existingTtlIndex = indexes.find((index) => (
    index.expireAfterSeconds !== undefined &&
    Object.keys(index.key).length === 1 &&
    index.key.createdAt !== undefined
  ));

  if (existingTtlIndex) return;

  await Order.collection.createIndex(
    { createdAt: 1 },
    { name: 'createdAt_ttl_30_days', expireAfterSeconds: ORDER_TTL_SECONDS }
  );
}

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
  await ensureOrderTtlIndex();
  await initializeDatabase();
  console.log('MongoDB connected and verified');
}

module.exports = { connectDatabase };
