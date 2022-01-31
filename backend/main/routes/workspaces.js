const express = require('express');
const router = express.Router();
const { getAll, getWorkspace, postWorkspace, putWorkspace, deleteWorkspace } = require('../controllers/workspaces');

router.route('/all').get(getAll);
router.route('/:id').get(getWorkspace).put(putWorkspace).delete(deleteWorkspace);
router.route('/').post(postWorkspace);

module.exports = router