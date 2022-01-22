const express = require('express');
const router = express.Router();
const { getFeed, getAll, getDiscover, getSearch, getWorkspace, postWorkspace, putWorkspace } = require('../controllers/workspaces');

router.route('/feed').get(getFeed);
router.route('/all').get(getAll);
router.route('/discover').get(getDiscover);
router.route('/search').get(getSearch);
router.route('/:id').get(getWorkspace).put(putWorkspace);
router.route('/').post(postWorkspace);

module.exports = router