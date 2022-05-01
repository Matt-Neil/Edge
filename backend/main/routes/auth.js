const express = require('express');
const router = express.Router();
// Defines all authentication controllers
const { postSignin, postSignup, getSignout, getUser } = require('../controllers/auth');

// Defined all authentication routes and their associated controller
router.route('/').get(getUser);
router.route('/signin').post(postSignin);
router.route('/signup').post(postSignup);
router.route('/signout').get(getSignout);

module.exports = router