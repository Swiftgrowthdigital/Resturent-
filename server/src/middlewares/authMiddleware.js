const { tokenFromCookie, verify } = require('../utils/adminSession');

function protect(req, res, next) {
  const session = verify(tokenFromCookie(req.headers.cookie));
  if (!session) return res.status(401).json({ message: 'Administrator sign-in required.' });
  req.admin = session;
  next();
}

function adminOnly(_req, _res, next) { next(); }

module.exports = { protect, adminOnly };
