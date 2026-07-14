const router = require('express').Router();
const { upload } = require('../middlewares/uploadMiddleware');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

router.post('/', upload.single('image'), uploadImage);
router.delete('/', deleteImage);

module.exports = router;
