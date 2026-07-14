const crypto = require('crypto');
const { createSession } = require('../utils/adminSession');

function login(req, res) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return res.status(503).json({ message: 'Dashboard authentication is not configured.' });
  const candidate = String(req.body.password || '');
  const valid = candidate.length === configuredPassword.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(configuredPassword));
  if (!valid) return res.status(401).json({ message: 'Invalid password.' });
  const token = createSession();
  res.json({ authenticated: true, token });
}

function logout(_req, res) { res.status(204).end(); }
function session(req, res) { res.json({ authenticated: Boolean(req.admin) }); }

module.exports = { login, logout, session };
