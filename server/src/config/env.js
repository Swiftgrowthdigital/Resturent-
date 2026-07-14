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
  const production = process.env.NODE_ENV === 'production';
  const errors = [];
  const required = ['MONGODB_URI'];
  if (production) required.push('CLIENT_URL', 'ADMIN_PASSWORD', 'ADMIN_TOKEN_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_STORAGE_BUCKET');

  for (const name of required) {
    if (!value(name)) errors.push(`${name} is required.`);
  }
  if (value('MONGODB_URI') && !/^mongodb(\+srv)?:\/\//.test(value('MONGODB_URI'))) {
    errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://.');
  }
  if (value('ADMIN_TOKEN_SECRET') && value('ADMIN_TOKEN_SECRET').length < 32) {
    errors.push('ADMIN_TOKEN_SECRET must be at least 32 characters long.');
  }

  for (const name of ['CLIENT_URL', ...(production ? [] : ['DEV_CLIENT_URL'])]) {
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
