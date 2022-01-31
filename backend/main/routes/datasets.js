const express = require('express');
const router = express.Router();
const { getAll, postDataset, getCheckPublic, getDataset, getWorkspaces, putDataset, deleteDataset } = require('../controllers/datasets');

router.route('/all').get(getAll)
router.route('/workspaces').get(getWorkspaces)
router.route('/check-public').get(getCheckPublic)
router.route('/:id').get(getDataset).put(putDataset).delete(deleteDataset);
router.route('/').post(postDataset);

module.exports = router