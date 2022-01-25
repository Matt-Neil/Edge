const express = require('express');
const router = express.Router();
const { getAll, getWorkspace, postWorkspace, putWorkspace, 
    putUpvote, putBookmark, putVisibility, putComment, getComments, putData } = require('../controllers/workspaces');

router.route('/all').get(getAll);
router.route('/upvote/:id').put(putUpvote);
router.route('/bookmark/:id').put(putBookmark);
router.route('/visibility/:id').put(putVisibility);
router.route('/comment/:id').put(putComment).get(getComments);
router.route('/update-data/:id').put(putData)
router.route('/:id').get(getWorkspace).put(putWorkspace);
router.route('/').post(postWorkspace);

module.exports = router