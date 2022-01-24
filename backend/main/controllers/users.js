const Users = require('../models/Users');
const Workspaces = require('../models/Workspaces');
const mongoose = require('mongoose');

exports.getCreated = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.aggregate([
            { 
                $match: {
                    creator: mongoose.Types.ObjectId(res.locals.currentUser._id)
                }
            }, {
                $project: {
                    _id: 0,
                    '_id': 1,
                    'creator': 1,
                    'title': 1,
                    'picture': 1,
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'visibility': 1,
                    'updated': 1,
                    'page': { $lt: ['$updated', new Date(req.query.date)] }
                }
            }, {
                $match: {
                    'page': true
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }
        ]).limit(21);
    
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

exports.getCreatedShort = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.aggregate([
            { 
                $match: {
                    creator: mongoose.Types.ObjectId(res.locals.currentUser._id)
                }
            }, {
                $project: {
                    _id: 0,
                    '_id': 1,
                    'title': 1,
                    'picture': 1,
                    'updated': 1
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }
        ]).limit(3);
    
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

exports.getBookmarked = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.aggregate([
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
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarked'] },
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'page': { $lt: ['$createdAt', new Date(req.query.date)] },
                    'creatorName.name': 1
                }
            }, {
                $match: {
                    $and: [
                        {
                            page: true
                        },
                        {
                            bookmarked: true
                        }
                    ]
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }
        ]).limit(21);
    
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

exports.getBookmarkedShort = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.aggregate([
            { 
                $match: {
                    visibility: true
                }
            }, { 
                $project: {
                    _id: 0,
                    '_id': 1,
                    'title': 1,
                    'picture': 1,
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarked'] },
                    'updated': 1
                }
            }, {
                $match: {
                    bookmarked: true
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }
        ]).limit(3);
    
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

exports.getUser = async (req, res, next) => {
    try {
        const user = await Users.findById(res.locals.currentUser._id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'No User Found.'
            })
        } else {
            res.status(201).json({
                success: true,
                data: user
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}