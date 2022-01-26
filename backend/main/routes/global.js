const express = require('express');
const router = express.Router();
const { getSearch, getFeed, putUpvote, putBookmark, putVisibility, putComment, getComments } = require('../controllers/global');

router.route('/search').get(getSearch);
router.route('/feed').get(getFeed);
router.route('/upvote/:id').put(putUpvote);
router.route('/bookmark/:id').put(putBookmark);
router.route('/visibility/:id').put(putVisibility);
router.route('/comment/:id').put(putComment).get(getComments);

module.exports = router