const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Food = require('../models/Food');

const getDashboard = asyncHandler(async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [orders, totalMenuItems, statusGroups] = await Promise.all([
    Order.find({}).sort({ createdAt: -1 }).limit(20).populate('items.food'),
    Food.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const todaysOrders = await Order.find({ createdAt: { $gte: today } });
  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const statusMap = statusGroups.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({
    stats: {
      todaysOrders: todaysOrders.length,
      todaysRevenue,
      pendingOrders: statusMap.Pending || 0,
      confirmedOrders: statusMap.Confirmed || 0,
      totalMenuItems
    },
    recentOrders: orders
  });
});

module.exports = { getDashboard };
