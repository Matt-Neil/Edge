const Datasets = require('../models/Datasets');
const Workspaces = require('../models/Workspaces')
const Users = require('../models/Users');
const mongoose = require('mongoose');

exports.getAll = async (req, res, next) => {
    try {
        const datasets = await Datasets.aggregate([
            { 
                $match: {
                    visibility: true
                }
            }, { 
                $lookup: { 
                    from: 'users', 
                    localField: 'creator', 
                    foreignField: '_id', 
                    as: 'creatorName' 
                }
            }, {
                $unwind: '$creatorName'
            }, { 
                $project: {
                    _id: 0,
                    '_id': 1,
                    'creator': 1,
                    'title': 1,
                    'picture': 1,
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'createdAt': 1,
                    'page': { $lt: ['$createdAt', new Date(req.query.date)] },
                    'creatorName.name': 1,
                    'type': "dataset"
                }
            }, {
                $match: {
                    page: true
                }
            }, { 
                $sort: { 
                    'createdAt': -1
                } 
            }
        ]);
    
        res.status(201).json({
            success: true,
            data: datasets
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getDataset = async (req, res, next) => {
    try {
        const dataset = await Datasets.aggregate([
            { 
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.id)
                }
            }, { 
                $lookup: { 
                    from: 'users', 
                    localField: 'creator', 
                    foreignField: '_id', 
                    as: 'creatorName' 
                }
            }, {
                $unwind: '$creatorName'
            }, { 
                $project: {
                    _id: 0,
                    '_id': 1,
                    'creator': 1,
                    'title': 1,
                    'description': 1,
                    'picture': 1,
                    'data': 1,
                    'visibility': 1,
                    'self': { $eq: [mongoose.Types.ObjectId(res.locals.currentUser._id), '$creator']},
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'creatorName.name': 1,
                    'type': "dataset"
                }
            }, {
                $match: {
                    $or: [
                        { 
                            $and: [
                                {
                                    visibility: false,
                                    self: true
                                }
                            ] 
                        }, { 
                            visibility: true
                        }
                    ]
                }
            }
        ]);

        res.status(201).json({
            success: true,
            data: dataset[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postDataset = async (req, res, next) => {
    try {
        const dataset = await Datasets.create(req.body);
        
        res.status(201).json({
            success: true,
            data: dataset._id
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putDataset = async (req, res, next) => {
    try {
        const dataset = await Datasets.findById(req.params.id)
        
        if (!dataset) {
            res.status(404).json({
                success: false,
                error: "No Dataset Found."
            })
        } else {
            dataset.title = req.body.title
            dataset.description = req.body.description
            dataset.picture = req.body.picture
            dataset.data = req.body.data
            dataset.updated = req.body.updated
            
            await dataset.save();

            res.status(201).json({
                success: true
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getCheckPublic = async (req, res, next) => {
    try {
        const check = await Datasets.findOne({ data: req.query.data }, '_id visibility data')
        
        if (check) {
            res.status(201).json({
                success: true,
                data: check
            })
        } else {
            res.status(201).json({
                success: false,
                data: ""
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.aggregate([
            { 
                $match: {
                    visibility: true,
                    data: mongoose.Types.ObjectId(req.query.id)
                }
            }, { 
                $lookup: { 
                    from: 'users', 
                    localField: 'creator', 
                    foreignField: '_id', 
                    as: 'creatorName' 
                }
            }, {
                $unwind: '$creatorName'
            }, { 
                $project: {
                    _id: 0,
                    '_id': 1,
                    'creator': 1,
                    'title': 1,
                    'picture': 1,
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'createdAt': 1,
                    'page': { $lt: ['$createdAt', new Date(req.query.date)] },
                    'creatorName.name': 1,
                    'type': "workspace"
                }
            }, {
                $match: {
                    page: true
                }
            }, { 
                $sort: { 
                    'createdAt': -1
                } 
            }
        ]);
    
        res.status(201).json({
            success: true,
            data: workspaces
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.deleteDataset = async (req, res, next) => {
    try {
        const dataset = await Datasets.findById(req.params.id)

        if (!dataset) {
            res.status(201).json({
                success: false,
                data: ""
            })
        } else {
            await dataset.remove()

            res.status(201).json({
                success: true,
                data: ""
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}