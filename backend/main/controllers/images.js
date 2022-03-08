const fs = require('fs');

exports.removeImage = async (req, res, next) => {
    const path = `images/${req.body.picture}`

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
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}
