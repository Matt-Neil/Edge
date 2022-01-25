const Workspaces = require('../models/Workspaces');
const Users = require('../models/Users');
const mongoose = require('mongoose');

exports.getAll = async (req, res, next) => {
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
                    'bookmarks': { $in: [res.locals.currentUser._id, '$bookmarks'] },
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
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspaces.aggregate([
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
                    'deployed': 1,
                    'visibility': 1,
                    'self': { $eq: [mongoose.Types.ObjectId(res.locals.currentUser._id), '$creator']},
                    'bookmarks': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'creatorName.name': 1,
                    'type': "workspace"
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
            data: workspace[0]
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.getComments = async (req, res, next) => {
    try {
        const comments = await Workspaces.findById(req.params.id, { _id: 0, comments: 1 })
                                            .populate('comments.user', 'name')

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

exports.postWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspaces.create(req.body);

        try {
            const user = await Users.findById(res.locals.currentUser._id);
    
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'No User Found.'
                })
            } else {
                const updatedWorkspaces = user.workspaces.concat(workspace._id)

                user.workspaces = updatedWorkspaces

                await user.save()

                res.status(201).json({
                    success: true,
                    data: workspace._id
                })
            }
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'Server Error'
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

exports.putWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspaces.findById(req.params.id);

        if (!workspace) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            workspace.data = req.body.data

            await workspace.save();

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

exports.putUpvote = async (req, res, next) => {
    try {
        const workspace = await Workspaces.findById(req.params.id);

        if (!workspace) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            let upvotes

            if (req.query.state === "true") {
                upvotes = workspace.upvotes
                upvotes.splice(upvotes.indexOf(res.locals.currentUser._id), 1)
            } else {
                upvotes = workspace.upvotes
                upvotes.push(res.locals.currentUser._id)
            }

            workspace.upvotes = upvotes
            
            await workspace.save();

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
        const workspace = await Workspaces.findById(req.params.id);

        if (!workspace) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            let bookmarks

            if (req.query.state === "true") {
                bookmarks = workspace.bookmarks
                bookmarks.splice(bookmarks.indexOf(res.locals.currentUser._id), 1)
            } else {
                bookmarks = workspace.bookmarks
                bookmarks.push(res.locals.currentUser._id)
            }

            workspace.bookmarks = bookmarks

            await workspace.save();

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
        const workspace = await Workspaces.findById(req.params.id);

        if (!workspace) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            workspace.visibility = !workspace.visibility

            await workspace.save();

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
        const workspace = await Workspaces.findById(req.params.id);

        if (!workspace) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            const addComment = {
                user: res.locals.currentUser._id,
                comment: req.body.comment
            }

            const comments = workspace.comments

            comments.unshift(addComment)
            workspace.comments = comments

            await workspace.save();

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

exports.putData = async (req, res, next) => {
    try {
        const workspace = await Workspaces.findById(req.params.id);

        if (!workspace) {
            res.status(404).json({
                success: false,
                error: "No Workspace Found."
            })
        } else {
            const addComment = {
                user: res.locals.currentUser._id,
                comment: req.body.comment
            }

            const comments = workspace.comments

            comments.unshift(addComment)
            workspace.comments = comments

            await workspace.save();

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