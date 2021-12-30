const Projects = require('../models/Projects');
const mongoose = require('mongoose');

exports.getProjects = async (req, res, next) => {
    try {
        const projects = await Projects.find({creator: res.locals.currentUser._id});
    
        res.status(201).json({
            success: true,
            data: projects
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getProject = async (req, res, next) => {
    try {
        const project = await Projects.findOne({ $and: [{ _id: req.params.id }, { creator: res.locals.currentUser._id }] });

        res.status(201).json({
            success: true,
            data: project
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}