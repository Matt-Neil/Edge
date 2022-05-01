const express = require('express');
const router = express.Router();
const multerSetup = require('../middleware/multerSetup');
// Defines images controllers
const { removeImage, uploadImage } = require('../controllers/images');

// Defines routes for images
router.route('/remove').put(removeImage);
// Adds multer middleware to upload endpoint
router.post('/upload', multerSetup, uploadImage);

module.exports = router