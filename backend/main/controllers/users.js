const Users = require('../models/Users');
const Items = require('../models/Items');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

exports.getRecent = async (req, res, next) => {
    try {
        const recent = await Items.aggregate([
            { 
                $match: {
                    creator: mongoose.Types.ObjectId(res.locals.currentUser._id)
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
                    'creatorName.name': 1,
                    'type': 1
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }
        ]);
    
        res.status(201).json({
            success: true,
            data: recent
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getCreated = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
            { 
                $match: {
                    creator: mongoose.Types.ObjectId(res.locals.currentUser._id),
                    type: req.query.type
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
                    'page': { $lt: ['$updated', new Date(req.query.date)] },
                    'type': 1
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
            data: items
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getCreatedShortcut = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
            { 
                $match: {
                    creator: mongoose.Types.ObjectId(res.locals.currentUser._id),
                    type: req.query.type
                }
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
            }
        ]).limit(3);
    
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

exports.getBookmarked = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
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
                    'page': { $lt: ['$createdAt', new Date(req.query.date)] },
                    'creatorName.name': 1,
                    'type': 1
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
            data: items
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getBookmarkedShortcut = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
            { 
                $match: {
                    visibility: true
                }
            }, { 
                $project: {
                    _id: 0,
                    '_id': 1,
                    'title': 1,
                    'creator': 1,
                    'picture': 1,
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    'updated': 1,
                    'type': 1
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
            data: items
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

exports.putUser = async (req, res, next) => {
    try {
        const user = await Users.findById(res.locals.currentUser._id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'No User Found.'
            })
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);

            user.password = hashedPassword
            
            await user.save()
            
            res.status(201).json({
                success: true,
                data: ""
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

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await Users.findById(res.locals.currentUser._id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'No User Found.'
            })
        } else {
            const items = await Items.find({creator: res.locals.currentUser._id})

            items.map(async item => {
                await item.remove()
            })
            
            await user.remove();

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