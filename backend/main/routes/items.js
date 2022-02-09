const express = require('express');
const router = express.Router();
const { getAll, postItem, getCheckPublicDataset, getItem, putItem, deleteItem, getAssociatedWorkspaces, getCreatedExperiments } = require('../controllers/items');

router.route('/all').get(getAll)
router.route('/check-public-dataset').get(getCheckPublicDataset)
router.route('/associated-workspaces').get(getAssociatedWorkspaces)
router.route('/created-experiments/:id').get(getCreatedExperiments)
router.route('/:id').get(getItem).put(putItem).delete(deleteItem);
router.route('/').post(postItem);

module.exports = router