const express = require('express');
const router = express.Router();
const { postSignin, postSignup, getSignout, getUser } = require('../controllers/auth');

router.route('/').get(getUser);

router.route('/signin').post(postSignin);

router.route('/signup').post(postSignup);

router.route('/signout').get(getSignout);

module.exports = router