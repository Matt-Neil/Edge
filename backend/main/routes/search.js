const express = require('express');
const router = express.Router();
const { getSearch } = require('../controllers/workspaces');

router.route('/').get(getSearch);

module.exports = router