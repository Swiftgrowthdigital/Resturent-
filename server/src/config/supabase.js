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

async function verifySupabaseStorage() {
  const supabase = getSupabaseStorageClient();
  const bucket = getStorageBucket();
  if (!supabase || !bucket) throw new Error('Supabase Storage is not configured. SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET are required.');

  const { data, error } = await supabase.storage.getBucket(bucket);
  if (error || !data) throw new Error(`Supabase Storage bucket "${bucket}" could not be verified: ${error?.message || 'bucket not found'}`);
  console.log(`Supabase Storage bucket verified: ${bucket}`);
}

module.exports = { getSupabaseStorageClient, getStorageBucket, verifySupabaseStorage };
