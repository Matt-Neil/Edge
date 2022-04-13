const Items = require('../models/Items');
const mongoose = require('mongoose');

exports.getPublic = async (req, res, next) => {
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
                    'visibility': 1,
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
                        'imageDir': 1,
                        'visibility': 1,
                        'labels': 1,
                        'height': 1,
                        'width': 1,
                        'rgb': 1,
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
                        'visibility': 1,
                        'model': 1,
                        'configuration': 1,
                        'evaluation': 1,
                        'self': { $eq: [mongoose.Types.ObjectId(res.locals.currentUser._id), '$creator']},
                        'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                        'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                        'upvotes': { $size: '$upvotes' },
                        'updated': 1,
                        'dataset.rgb': 1,
                        'dataset.picture': 1,
                        'dataset.title': 1,
                        'dataset.imageDir': 1,
                        'dataset.labels': 1,
                        'dataset._id': 1, 
                        'dataset.height': 1,
                        'dataset.width': 1,
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
        console.log(err)
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
                error: "No Item Found."
            })
        } else {
            item.title = req.body.title
            item.description = req.body.description
            item.picture = req.body.picture
            item.updated = req.body.updated

            if (item.type === "dataset") {
                item.labels = req.body.labels
                item.rgb = req.body.rgb
                item.height = req.body.height
                item.width = req.body.width
            } else {
                item.model = req.body.model
                item.configuration = req.body.configuration
                item.dataset = req.body.dataset
                item.evaluation = req.body.evaluation
            }
            
            await item.save();

            res.status(201).json({
                success: true
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getCheckPublicDataset = async (req, res, next) => {
    try {
        const check = await Items.findById(req.query.id, '_id creator visibility imageDir labels title height width')
        
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
                    dataset: mongoose.Types.ObjectId(req.query.id),
                    type: "workspace"
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
                    'title': 1,
                    'creator': 1,
                    'picture': 1,
                    'updated': 1,
                    'type': 1
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }, { 
                $limit : 5
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