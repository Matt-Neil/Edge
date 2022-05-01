const fs = require('fs');

exports.removeImage = async (req, res, next) => {
    // Defines image path
    const path = `images/${req.body.picture}`

    // Deletes image path given
    fs.unlink(path, (err) => {
        if (err) {
            console.log(err);
            return
        }
    })
}

exports.uploadImage = async (req, res, next) => {
    try {
        res.status(201).json({
            success: true,
            data: req.file.filename
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}
