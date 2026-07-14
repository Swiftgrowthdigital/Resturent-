const { getAllowedOrigins } = require('./env');

const allowedOrigins = getAllowedOrigins();

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  const error = new Error(`Origin is not allowed by CORS: ${origin}`);
  error.statusCode = 403;
  return callback(error);
}

const corsOptions = { origin: corsOrigin, credentials: true };

module.exports = { allowedOrigins, corsOptions };
