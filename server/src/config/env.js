function value(name) {
  return String(process.env[name] || '').trim();
}

function normalizeOrigin(name, required) {
  const raw = value(name);
  if (!raw) {
    if (required) throw new Error(`${name} is required.`);
    return '';
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== raw.replace(/\/$/, '')) {
    throw new Error(`${name} must be an origin only (for example, https://app.example.com) with no path or query.`);
  }
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS in production.`);
  }
  return url.origin;
}

function validateEnvironment() {
  const errors = [];
  const required = ['PORT', 'NODE_ENV', 'TRUST_PROXY', 'CLIENT_URL', 'MONGODB_URI', 'ADMIN_PASSWORD', 'JWT_SECRET', 'RESTAURANT_NAME', 'RESTAURANT_CURRENCY', 'ORDER_PREFIX', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_STORAGE_BUCKET'];

  for (const name of required) {
    if (!value(name)) errors.push(`${name} is required.`);
  }
  if (value('MONGODB_URI') && !/^mongodb(\+srv)?:\/\//.test(value('MONGODB_URI'))) {
    errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://.');
  }
  if (value('PORT') && (!/^\d+$/.test(value('PORT')) || Number(value('PORT')) < 1 || Number(value('PORT')) > 65535)) errors.push('PORT must be a valid TCP port number.');
  if (value('NODE_ENV') && !['development', 'test', 'production'].includes(value('NODE_ENV'))) errors.push('NODE_ENV must be development, test, or production.');
  if (!['true', 'false'].includes(value('TRUST_PROXY').toLowerCase())) errors.push('TRUST_PROXY must be true or false.');
  if (value('RESTAURANT_CURRENCY') && !/^[A-Z]{3}$/.test(value('RESTAURANT_CURRENCY'))) errors.push('RESTAURANT_CURRENCY must be a three-letter ISO currency code.');
  if (value('ORDER_PREFIX') && !/^[A-Z0-9-]{1,12}$/.test(value('ORDER_PREFIX'))) errors.push('ORDER_PREFIX may contain only uppercase letters, digits, and hyphens.');
  if (value('JWT_SECRET') && value('JWT_SECRET').length < 64) {
    errors.push('JWT_SECRET must be at least 64 characters long.');
  }

  for (const name of ['CLIENT_URL', ...(process.env.NODE_ENV === 'production' ? [] : ['DEV_CLIENT_URL'])]) {
    if (!value(name)) continue;
    try {
      normalizeOrigin(name, false);
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (value('SUPABASE_URL')) {
    try {
      const url = new URL(value('SUPABASE_URL'));
      if (url.protocol !== 'https:') throw new Error();
    } catch {
      errors.push('SUPABASE_URL must be a valid HTTPS URL.');
    }
  }

  if (errors.length) {
    throw new Error(`Invalid server environment:\n- ${errors.join('\n- ')}`);
  }
}

function getAllowedOrigins() {
  const origins = [normalizeOrigin('CLIENT_URL', false)].filter(Boolean);
  if (process.env.NODE_ENV !== 'production') {
    const devOrigin = normalizeOrigin('DEV_CLIENT_URL', false);
    if (devOrigin) origins.push(devOrigin);
  }
  return [...new Set(origins)];
}

module.exports = { getAllowedOrigins, validateEnvironment };
