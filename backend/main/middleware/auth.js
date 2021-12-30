const Users = require('../models/Users');
const jwt = require('jsonwebtoken');

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, "edge secret", async (err, decodedToken) => {
            if (err) {
                res.locals.currentUser = null;
                next();
            } else {
                const user = await Users.findById(decodedToken.id);

                res.locals.currentUser = user;
                next();
            }
        });
    } else {
        res.locals.currentUser = null;
        next();
    }
}

module.exports = { checkUser }