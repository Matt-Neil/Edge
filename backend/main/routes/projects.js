const express = require('express');
const router = express.Router();
const { getProjects, getProject } = require('../controllers/projects');

router.route('/').get(getProjects);
router.route('/:id').get(getProject);

module.exports = router