const multer = require('multer');

const storage = multer.memoryStorage();
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WebP images up to 5MB are allowed.'));
    }
    cb(null, true);
  }
});

module.exports = { upload };
