const crypto = require('crypto');
const { COOKIE_NAME, SESSION_TTL_SECONDS, createSession } = require('../utils/adminSession');

function cookieOptions() {
  return { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: SESSION_TTL_SECONDS * 1000, path: '/' };
}

function login(req, res) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return res.status(503).json({ message: 'Dashboard authentication is not configured.' });
  const candidate = String(req.body.password || '');
  const valid = candidate.length === configuredPassword.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(configuredPassword));
  if (!valid) return res.status(401).json({ message: 'Invalid password.' });
  res.cookie(COOKIE_NAME, createSession(), cookieOptions());
  res.json({ authenticated: true });
}

function logout(_req, res) { res.clearCookie(COOKIE_NAME, cookieOptions()).status(204).end(); }
function session(req, res) { res.json({ authenticated: Boolean(req.admin) }); }

module.exports = { login, logout, session };
