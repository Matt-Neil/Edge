const express = require('express');
const router = express.Router();
const { getFeed, getAll, getDiscover, getSearch, getWorkspace, postWorkspace, putWorkspace, 
    putUpvote, putBookmark, putVisibility, putComment, getComments } = require('../controllers/workspaces');

router.route('/feed').get(getFeed);
router.route('/all').get(getAll);
router.route('/discover').get(getDiscover);
router.route('/search').get(getSearch);
router.route('/upvote/:id').put(putUpvote);
router.route('/bookmark/:id').put(putBookmark);
router.route('/visibility/:id').put(putVisibility);
router.route('/comment/:id').put(putComment).get(getComments);
router.route('/:id').get(getWorkspace).put(putWorkspace);
router.route('/').post(postWorkspace);

module.exports = router