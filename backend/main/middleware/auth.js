const Users = require('../models/Users');
const jwt = require('jsonwebtoken');

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    // Checks if there any user currently signed in indicated by the existence of a JWT token
    if (token) {
        // Checks the authenticity of the JWT token
        jwt.verify(token, "a*7NJDia$:7dnSi2j*6\%", async (err, decodedToken) => {
            if (err) {
                res.locals.currentUser = null;
                // next() ends the request-response cycle and passes control to the next middleware
                next();
            } else {
                // Fetches the authenticated user from the MongoDB database
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