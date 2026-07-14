const crypto = require('crypto');

const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 64) throw new Error('JWT_SECRET must be at least 64 characters.');
  return secret;
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(payload) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  const content = `${header}.${body}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(content).digest('base64url');
  return `${content}.${signature}`;
}

function verify(token) {
  try {
    const [header, encoded, signature] = String(token || '').split('.');
    if (!header || !encoded || !signature) return null;
    const parsedHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    if (parsedHeader.alg !== 'HS256' || parsedHeader.typ !== 'JWT') return null;
    const expected = crypto.createHmac('sha256', getSecret()).update(`${header}.${encoded}`).digest('base64url');
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    return payload.role === 'admin' && Number(payload.exp) > Math.floor(Date.now() / 1000) ? payload : null;
  } catch { return null; }
}

function createSession() {
  return sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
}

module.exports = { SESSION_TTL_SECONDS, createSession, verify };
