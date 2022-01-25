const express = require('express');
const router = express.Router();
const { getAll } = require('../controllers/datasets');

router.route('/all').get(getAll)
router.route('/:id')
router.route('/')

module.exports = router