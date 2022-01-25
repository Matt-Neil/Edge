const express = require('express');
const router = express.Router();
const { getFeed } = require('../controllers/global');

router.route('/feed').get(getFeed);

module.exports = router