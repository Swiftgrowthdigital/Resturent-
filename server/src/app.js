const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const seatRoutes = require('./routes/seatRoutes');
const foodRoutes = require('./routes/foodRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middlewares/authMiddleware');
const { sanitizeRequest } = require('./middlewares/sanitizeMiddleware');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { getRestaurantName } = require('./config/restaurant');
const { corsOptions } = require('./config/cors');

const app = express();

if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors(corsOptions)
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'restaurant-qr-menu-api' });
});

app.get('/api/brand', (_req, res) => {
  res.json({ name: getRestaurantName() });
});

app.get('/api/manifest.webmanifest', (_req, res) => {
  const clientOrigin = process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : (process.env.DEV_CLIENT_URL || process.env.CLIENT_URL);
  res.type('application/manifest+json').json({
    name: getRestaurantName(),
    short_name: getRestaurantName(),
    start_url: '/menu',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#f97316',
    icons: [{ src: `${clientOrigin}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' }]
  });
});

app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', protect, orderRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/foods', protect, foodRoutes);
app.use('/api/categories', protect, categoryRoutes);
app.use('/api/upload', protect, uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
