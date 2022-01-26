const express = require('express');
const router = express.Router();
const { getAll, getWorkspace, postWorkspace, putWorkspace } = require('../controllers/workspaces');

router.route('/all').get(getAll);
router.route('/:id').get(getWorkspace).put(putWorkspace);
router.route('/').post(postWorkspace);

module.exports = router