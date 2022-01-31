const Datasets = require('../models/Datasets');
const Workspaces = require('../models/Workspaces');
const mongoose = require('mongoose');

exports.getSearch = async (req, res, next) => {
    try {
        let items

        if (req.query.type === "workspace") {
            items = await Workspaces.aggregate([
                { 
                    $match: { 
                        $text: { 
                            $search: req.query.phrase
                        },
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
                        'bookmarks': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                        'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                        'upvotes': { $size: '$upvotes' },
                        'updated': 1,
                        'createdAt': 1,
                        'page': { $lt: ['$_id', mongoose.Types.ObjectId(req.query.id)] },
                        'creatorName.name': 1,
                        'type': "workspace"
                    }
                }, {
                    $match: {
                        page: true
                    }
                }, { 
                    $sort: { 
                        '_id': -1
                    } 
                }
            ]).limit(21);
        } else {
            items = await Datasets.aggregate([
                { 
                    $match: { 
                        $text: { 
                            $search: req.query.phrase
                        },
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
                        'bookmarks': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                        'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                        'upvotes': { $size: '$upvotes' },
                        'updated': 1,
                        'createdAt': 1,
                        'page': { $lt: ['$_id', mongoose.Types.ObjectId(req.query.id)] },
                        'creatorName.name': 1,
                        'type': "dataset"
                    }
                }, {
                    $match: {
                        page: true
                    }
                }, { 
                    $sort: { 
                        '_id': -1
                    } 
                }
            ]).limit(21);
        }
    
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

exports.getFeed = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.aggregate([
            { 
                $match: {
                    visibility: true,
                    creator: {$ne: mongoose.Types.ObjectId(res.locals.currentUser._id)}
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
                    'description': 1,
                    'title': 1,
                    'picture': 1,
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'creatorName.name': 1,
                    'type': "workspace"
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }
        ]).limit(40);

        const datasets = await Datasets.aggregate([
            { 
                $match: {
                    visibility: true,
                    creator: {$ne: mongoose.Types.ObjectId(res.locals.currentUser._id)}
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
                    'description': 1,
                    'title': 1,
                    'picture': 1,
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'creatorName.name': 1,
                    'type': "dataset"
                }
            }, { 
                $sort: { 
                    'updated': -1
                } 
            }
        ]).limit(40);

        feed = workspaces.concat(datasets)
        feed = feed.map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)
    
        res.status(201).json({
            success: true,
            data: feed
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getComments = async (req, res, next) => {
    try {
        let comments

        if (req.query.type === "workspace") {
            comments = await Workspaces.findById(req.params.id, { _id: 0, comments: 1 })
                                                .populate('comments.user', 'name')
        } else {
            comments = await Datasets.findById(req.params.id, { _id: 0, comments: 1 })
                                                .populate('comments.user', 'name')
        }

        res.status(201).json({
            success: true,
            data: comments.comments
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.putUpvote = async (req, res, next) => {
    try {
        let item

        if (req.query.type === "workspace") {
            item = await Workspaces.findById(req.params.id);
        } else {
            item = await Datasets.findById(req.params.id);
        }

        if (!item) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            let upvotes

            if (req.query.state === "true") {
                upvotes = item.upvotes
                upvotes.splice(upvotes.indexOf(res.locals.currentUser._id), 1)
            } else {
                upvotes = item.upvotes
                upvotes.push(res.locals.currentUser._id)
            }

            item.upvotes = upvotes
            
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

exports.putBookmark = async (req, res, next) => {
    try {
        let item

        if (req.query.type === "workspace") {
            item = await Workspaces.findById(req.params.id);
        } else {
            item = await Datasets.findById(req.params.id);
        }

        if (!item) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            let bookmarks

            if (req.query.state === "true") {
                bookmarks = item.bookmarks
                bookmarks.splice(bookmarks.indexOf(res.locals.currentUser._id), 1)
            } else {
                bookmarks = item.bookmarks
                bookmarks.push(res.locals.currentUser._id)
            }

            item.bookmarks = bookmarks

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

exports.putVisibility = async (req, res, next) => {
    try {
        let item

        if (req.query.type === "workspace") {
            item = await Workspaces.findById(req.params.id);
        } else {
            item = await Datasets.findById(req.params.id);
        }

        if (!item) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            item.visibility = !item.visibility

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

exports.putComment = async (req, res, next) => {
    try {
        let item

        if (req.query.type === "workspace") {
            item = await Workspaces.findById(req.params.id);
        } else {
            item = await Datasets.findById(req.params.id);
        }

        if (!item) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            const addComment = {
                user: res.locals.currentUser.name,
                comment: req.body.comment
            }

            const comments = item.comments

            comments.unshift(addComment)
            item.comments = comments

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