const express = require('express');
const router = express.Router();
const { getCreated, getBookmarked, getBookmarkedShortcut, getCreatedShortcut, getUser, putUser, deleteUser } = require('../controllers/users');

router.route('/bookmarked').get(getBookmarked);
router.route('/created').get(getCreated);
router.route('/bookmarked-shortcut').get(getBookmarkedShortcut);
router.route('/created-shortcut').get(getCreatedShortcut);
router.route('/').get(getUser).put(putUser).delete(deleteUser);

module.exports = router