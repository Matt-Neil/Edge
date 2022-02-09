const Items = require('../models/Items');
const mongoose = require('mongoose');

exports.getAll = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
            { 
                $match: {
                    visibility: true,
                    type: req.query.type
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
                    'type': 1
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
            data: items
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getItem = async (req, res, next) => {
    try {
        let item 

        if (req.query.type === "dataset") {
            item = await Items.aggregate([
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
                        'datafile': 1,
                        'visibility': 1,
                        'normalised': 1,
                        'self': { $eq: [mongoose.Types.ObjectId(res.locals.currentUser._id), '$creator']},
                        'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                        'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                        'upvotes': { $size: '$upvotes' },
                        'updated': 1,
                        'creatorName.name': 1,
                        'type': 1
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
        } else {
            item = await Items.aggregate([
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
                    $lookup: { 
                        from: 'items', 
                        localField: 'dataset', 
                        foreignField: '_id', 
                        as: 'dataset' 
                    }
                }, {
                    $unwind: '$dataset'
                }, { 
                    $project: {
                        _id: 0,
                        '_id': 1,
                        'creator': 1,
                        'title': 1,
                        'description': 1,
                        'picture': 1,
                        'data': 1,
                        'deployed': 1,
                        'visibility': 1,
                        'experiments': 1,
                        'self': { $eq: [mongoose.Types.ObjectId(res.locals.currentUser._id), '$creator']},
                        'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                        'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                        'upvotes': { $size: '$upvotes' },
                        'updated': 1,
                        'dataset.datafile': 1,
                        'dataset._id': 1,
                        'creatorName.name': 1,
                        'type': 1
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
        }

        res.status(201).json({
            success: true,
            data: item[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.postItem = async (req, res, next) => {
    try {
        const item = await Items.create(req.body);
        
        res.status(201).json({
            success: true,
            data: item._id
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putItem = async (req, res, next) => {
    try {
        const item = await Items.findById(req.params.id)
        
        if (!item) {
            res.status(404).json({
                success: false,
                error: "No Dataset Found."
            })
        } else {
            item.title = req.body.title
            item.description = req.body.description
            item.picture = req.body.picture
            item.updated = req.body.updated

            if (item.type === "dataset") {
                item.datafile = req.body.datafile
            } else {
                item.dataset = req.body.dataset
            }
            
            await item.save();

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

exports.getCheckPublicDataset = async (req, res, next) => {
    try {
        const check = await Items.findOne({ datafile: req.query.datafile }, '_id visibility dataset')
        
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

exports.getAssociatedWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Items.aggregate([
            { 
                $match: {
                    visibility: true,
                    dataset: mongoose.Types.ObjectId(req.query.id)
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
                    'type': 1
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

exports.deleteItem = async (req, res, next) => {
    try {
        const item = await Items.findById(req.params.id)

        if (!item) {
            res.status(201).json({
                success: false,
                data: ""
            })
        } else {
            if (item.creator === res.locals.currentUser._id) {
                await item.remove()
            }

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

exports.getCreatedExperiments = async (req, res, next) => {
    try {
        const workspace = await Items.findById(req.params.id, "experiments")

        res.status(201).json({
            success: true,
            data: workspace
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}