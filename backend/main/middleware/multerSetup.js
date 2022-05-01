const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Defines the destination and filename of the uploaded image
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        callback(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
    }
});

// Filters only image file types
const fileFilter = (req, file, callback) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedFileTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

// Only accepts a single image to be uploaded
const upload = multer({
    storage: storage, 
    fileFilter: fileFilter
}).single("image");

module.exports = upload