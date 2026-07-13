const asyncHandler = require('../utils/asyncHandler');
const path = require('path');
const crypto = require('crypto');
const { getSupabaseStorageClient, getStorageBucket } = require('../config/supabase');

const uploadFolders = { food: 'foods', category: 'categories', logo: 'logos', banner: 'banners' };
const signatures = {
  'image/jpeg': (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/gif': (buffer) => buffer.subarray(0, 6).toString() === 'GIF87a' || buffer.subarray(0, 6).toString() === 'GIF89a',
  'image/webp': (buffer) => buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP'
};

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }
  if (!signatures[req.file.mimetype]?.(req.file.buffer)) return res.status(400).json({ message: 'Invalid image file.' });

  const supabase = getSupabaseStorageClient();
  if (!supabase) {
    return res.status(501).json({ message: 'Supabase Storage is not configured' });
  }

  const folder = uploadFolders[req.body.type] || uploadFolders.food;
  const extension = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
  const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}${extension}`;
  const bucket = getStorageBucket();
  const { error } = await supabase.storage.from(bucket).upload(fileName, req.file.buffer, {
    contentType: req.file.mimetype,
    cacheControl: '31536000',
    upsert: false
  });

  if (error) return res.status(502).json({ message: 'Unable to upload image to Supabase Storage' });
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return res.status(201).json({ url: data.publicUrl });
});

module.exports = { uploadImage };
