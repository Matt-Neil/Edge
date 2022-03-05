const express = require('express');
const router = express.Router();
const { getPublic, postItem, getCheckPublicDataset, getItem, putItem, deleteItem, getAssociatedWorkspaces, getRecent } = require('../controllers/items');

router.route('/public').get(getPublic)
router.route('/recent').get(getRecent)
router.route('/check-public-dataset').get(getCheckPublicDataset)
router.route('/associated-workspaces').get(getAssociatedWorkspaces)
router.route('/:id').get(getItem).put(putItem).delete(deleteItem);
router.route('/').post(postItem);

module.exports = router