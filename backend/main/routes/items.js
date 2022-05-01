const express = require('express');
const router = express.Router();
// Defines all workspace and dataset controllers
const { getPublic, postItem, getCheckPublicDataset, getItem, putItem, deleteItem, getAssociatedWorkspaces } = require('../controllers/items');

// Defines all workspace and dataset endpoints and their associated controllers
router.route('/public').get(getPublic)
router.route('/check-public-dataset').get(getCheckPublicDataset)
router.route('/associated-workspaces').get(getAssociatedWorkspaces)
router.route('/:id').get(getItem).put(putItem).delete(deleteItem);
router.route('/').post(postItem);

module.exports = router