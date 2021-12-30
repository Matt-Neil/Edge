const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const maxAge = 30 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'edge secret', {
        expiresIn: maxAge
    })
}

const handleErrors = (err) => {
    let errors = { email: "", password: "", name: "" };

    if (err.message === "Incorrect email") {
        errors.email = "Incorrect email"
    }

    if (err.message === "Incorrect password") {
        errors.password = "Incorrect password"
    }

    if (err.code === 11000) {
        errors.email = 'That email has already been registered';
        return errors;
    }

    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            console.log(err.errors)
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

exports.postSignin = async (req, res, next) => {
    try {
        const user = await Users.findOne({ email: req.body.email });

        if (user) {
            const auth = await bcrypt.compare(req.body.password, user.password);

            if (auth) {
                const token = createToken(user._id);

                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
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
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

exports.postSignup = async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);
        const user = await Users.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            projects: []
        });
        const token = createToken(user._id);

        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({
            success: true,
            data: { user: user._id }
        })
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

exports.getSignout = async (req, res, next) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.send("Signed Out");
}

exports.getUser = async (req, res, next) => {
    try {
        const user = res.locals.currentUser;

        if (user) {
            res.status(201).json({
                success: true,
                user: true,
                data: user
            })
        } else {
            res.send({ user: false });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}