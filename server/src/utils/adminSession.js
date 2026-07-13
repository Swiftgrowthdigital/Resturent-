const crypto = require('crypto');

const COOKIE_NAME = 'restaurant_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_TOKEN_SECRET must be at least 32 characters.');
  return secret;
}

function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verify(token) {
  try {
    if (!token || !token.includes('.')) return null;
    const [encoded, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    return payload.role === 'admin' && Number(payload.exp) > Math.floor(Date.now() / 1000) ? payload : null;
  } catch { return null; }
}

function tokenFromCookie(cookieHeader = '') {
  return cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
}

function createSession() {
  return sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
}

module.exports = { COOKIE_NAME, SESSION_TTL_SECONDS, createSession, tokenFromCookie, verify };
