const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const maxAge = 30 * 24 * 60 * 60;

// Function creates and returns a signed JWT token
const createToken = (id) => {
    return jwt.sign({ id }, 'a*7NJDia$:7dnSi2j*6%', {
        expiresIn: maxAge
    })
}

exports.postSignin = async (req, res, next) => {
    try {
        // Fetches the user with that has the same email
        const user = await Users.findOne({ email: req.body.email });

        // If such a user exists
        if (user) {
            // Compares the decrypted password fetched from the database and the password received from the request body
            const auth = await bcrypt.compare(req.body.password, user.password);

            // If they passwords match
            if (auth) {
                // A signed JWT token is created using the signed in user's ID
                const token = createToken(user._id);

                // A cookie response containing the signed JWT token is created
                res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 })
                res.status(201).json({
                    success: true,
                    data: user._id
                })
            } else {
                throw "Wrong Password"
            }
        } else {
            throw "Wrong Email"
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            error: "Sign in error"
        })
    }
}

exports.postSignup = async (req, res, next) => {
    try {
        // Hashes the password received in the body of the request
        const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);
        // Creates a new document in the users collection using the Users model
        const user = await Users.create({
            email: req.body.email,
            name: req.body.name,
            password: hashedPassword
        });
        // Creates a signed JWT token using the new user's ID
        const token = createToken(user._id);

        // A cookie response containing the signed JWT token is created
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({
            success: true,
            data: { user: user._id }
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            error: "Sign Up Error"
        })
    }
}

// Creates an empty cookie and send it to the front-end
exports.getSignout = async (req, res, next) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.send("Signed Out");
}

// Gets the currently signed-in user's information
exports.getUser = async (req, res, next) => {
    try {
        // Gets the user information from the ExpressJS local variable
        const user = res.locals.currentUser;

        // Checks if a user is stored
        if (user) {
            // Returns user information
            res.status(201).json({
                success: true,
                user: true,
                data: user
            })
        } else {
            // Returns no user
            res.send({ user: false });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}