const express = require('express');
const router = express.Router();
const { getCreatedWorkspaces, getCreatedDatasets, getBookmarkedWorkspaces, getBookmarkedDatasets, getBookmarkedWorkspacesShort, 
    getBookmarkedDatasetsShort, getCreatedWorkspacesShort, getCreatedDatasetsShort, getUser } = require('../controllers/users');

router.route('/bookmarked-workspaces').get(getBookmarkedWorkspaces);
router.route('/bookmarked-datasets').get(getBookmarkedDatasets);
router.route('/created-workspaces').get(getCreatedWorkspaces);
router.route('/created-datasets').get(getCreatedDatasets);
router.route('/bookmarked-workspaces-shortcut').get(getBookmarkedWorkspacesShort);
router.route('/bookmarked-datasets-shortcut').get(getBookmarkedDatasetsShort);
router.route('/created-workspaces-shortcut').get(getCreatedWorkspacesShort);
router.route('/created-datasets-shortcut').get(getCreatedDatasetsShort);
router.route('/').get(getUser);

module.exports = router