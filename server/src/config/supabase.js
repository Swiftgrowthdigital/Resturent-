const { createClient } = require('@supabase/supabase-js');

function getSupabaseStorageClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET;
}

function getStoragePathFromPublicUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${getStorageBucket()}/`;
    const index = parsed.pathname.indexOf(marker);
    return index === -1 ? '' : decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return '';
  }
}

async function deletePublicStorageUrl(url) {
  const path = getStoragePathFromPublicUrl(url);
  if (!path) return;
  const supabase = getSupabaseStorageClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from(getStorageBucket()).remove([path]);
  if (error) console.error('[Supabase Storage cleanup error]', { path, message: error.message });
}

async function verifySupabaseStorage() {
  const supabase = getSupabaseStorageClient();
  const bucket = getStorageBucket();
  if (!supabase || !bucket) throw new Error('Supabase Storage is not configured. SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET are required.');

  const { data, error } = await supabase.storage.getBucket(bucket);
  if (error || !data) {
    const message = String(error?.message || '').toLowerCase();
    if (error?.statusCode === 404 || message.includes('not found') || message.includes('does not exist')) {
      throw new Error("Supabase bucket 'restaurant-images' not found.");
    }
    if (error?.statusCode === 401 || error?.statusCode === 403 || message.includes('jwt') || message.includes('api key') || message.includes('unauthorized')) {
      throw new Error('Supabase Service Role Key is invalid or cannot access Storage.');
    }
    throw new Error(`Supabase Storage bucket "${bucket}" could not be verified: ${error?.message || 'unknown error'}`);
  }
  console.log(`Supabase Storage bucket verified: ${bucket}`);
}

module.exports = { getSupabaseStorageClient, getStorageBucket, getStoragePathFromPublicUrl, deletePublicStorageUrl, verifySupabaseStorage };
