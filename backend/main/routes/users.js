const express = require('express');
const router = express.Router();
const { getCreated, getBookmarked, getBookmarkedShort, getCreatedShort, getUser } = require('../controllers/users');

router.route('/bookmarked').get(getBookmarked);
router.route('/created').get(getCreated);
router.route('/bookmarkedShort').get(getBookmarkedShort);
router.route('/createdShort').get(getCreatedShort);
router.route('/').get(getUser);

module.exports = router