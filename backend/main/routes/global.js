const express = require('express');
const router = express.Router();
// Defines all global controllers
const { getSearch, putUpvote, putBookmark, putVisibility } = require('../controllers/global');

// Defined all global routes and their associated controller
router.route('/search').get(getSearch);
router.route('/upvote/:id').put(putUpvote);
router.route('/bookmark/:id').put(putBookmark);
router.route('/visibility/:id').put(putVisibility);

module.exports = router