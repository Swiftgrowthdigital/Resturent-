const { verify } = require('../utils/adminSession');

function protect(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const session = verify(match?.[1]);
  if (!session) return res.status(401).json({ message: 'Administrator sign-in required.' });
  req.admin = session;
  next();
}

function adminOnly(_req, _res, next) { next(); }

module.exports = { protect, adminOnly };
