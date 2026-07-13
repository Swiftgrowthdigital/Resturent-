const router = require('express').Router();
const { upload } = require('../middlewares/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');

router.post('/', upload.single('image'), uploadImage);

module.exports = router;
