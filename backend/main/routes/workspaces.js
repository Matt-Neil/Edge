const express = require('express');
const router = express.Router();
const { getWorkspaces, getWorkspace, postWorkspace, putWorkspace } = require('../controllers/workspaces');

router.route('/').get(getWorkspaces).post(postWorkspace);
router.route('/:id').get(getWorkspace).put(putWorkspace);

module.exports = router