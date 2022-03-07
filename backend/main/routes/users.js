const express = require('express');
const router = express.Router();
const { getCreated, getBookmarked, getBookmarkedShortcut, getCreatedShortcut, getUser, putUser, deleteUser, getRecent } = require('../controllers/users');

router.route('/recent').get(getRecent)
router.route('/bookmarked').get(getBookmarked);
router.route('/created').get(getCreated);
router.route('/bookmarked-shortcut').get(getBookmarkedShortcut);
router.route('/created-shortcut').get(getCreatedShortcut);
router.route('/').get(getUser).put(putUser).delete(deleteUser);

module.exports = router