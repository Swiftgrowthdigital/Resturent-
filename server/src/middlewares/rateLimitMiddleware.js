const rateLimit = require('express-rate-limit');

function createLimiter({ windowMs, max, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: { message }
  });
}

const seatValidationLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 40,
  message: 'Too many seat validation requests. Please try again shortly.'
});

const orderCreationLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Too many order attempts. Please try again shortly.'
});

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many sign-in attempts. Please try again later.',
  skipSuccessfulRequests: true
});

module.exports = { seatValidationLimiter, orderCreationLimiter, loginLimiter };
