const Users = require('../models/Users');
const Items = require('../models/Items');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Finds the currently signed-in user's created workspaces and datasets sorted by updated date
exports.getRecent = async (req, res, next) => {
    try {
        const recent = await Items.aggregate([
            { 
                // Matches the creator with the currently signed-in user
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

// Returns all currently signed-in user's created workspaces and datasets
exports.getCreated = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
            { 
                // Matches all workspaces or datasets where the creator is the currently signed-in user
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
                    // Checks if the creator has upvoted the workspace or dataset
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    // Finds the number of upvotes
                    'upvotes': { $size: '$upvotes' },
                    'visibility': 1,
                    'updated': 1,
                    // Checks whether the updated date is older than the updated date of the last document returned
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

// Returns a shortened list of all currently signed-in user's created workspaces and datasets
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
        // Only returns the first 3 documents
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

// Returns all currently signed-in user's bookmarked workspaces and datasets
exports.getBookmarked = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
            { 
                // Matches to all public workspaces or datasets
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
                    // Checks whether currently signed-in user has bookmarked the workspace or dataset
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    // Checks whether currently signed-in user has upvoted the workspace or dataset
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    // Calculates the number of upvotes
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    // Checks whether the updated date is older than the updated date of the last document returned
                    'page': { $lt: ['$updated', new Date(req.query.date)] },
                    'creatorName.name': 1,
                    'type': 1
                }
            }, {
                // Matches if the document is in the next page and has been bookmarked
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
                // Sorts documents in descending order by date last updated
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

// Returns a shortened list of all currently signed-in user's bookmarked workspaces and datasets
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
                // Matches all documents that have been bookmarked
                $match: {
                    bookmarked: true
                }
            }, { 
                // Sorts all documents in descending order by last date it was updated
                $sort: { 
                    'updated': -1
                } 
            }
        // Only returns the first 3 documents
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

// Retrieves the currently signed-in user information
exports.getUser = async (req, res, next) => {
    try {
        // Queries currently signed-in user using ID stored in local variable
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

// Updates the currently signed-in user
exports.putUser = async (req, res, next) => {
    try {
        // Returns the currently signed-in user document
        const user = await Users.findById(res.locals.currentUser._id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'No User Found.'
            })
        } else {
            // Hashes the new password
            const hashedPassword = await bcrypt.hash(req.body.password.toString(), 10);

            user.password = hashedPassword
            
            // Updates user document with new password
            await user.save()
            
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

// The controller that conducts the request to delete a user
exports.deleteUser = async (req, res, next) => {
    try {
        // Fetches the user information from the MongoDB database using the Users model and the currently signed in user ID
        const user = await Users.findById(res.locals.currentUser._id);

        if (!user) {
            res.status(404).json({
                success: false,
                error: "No User Found."
            })
        } else {
            // Fetches all workspaces and datasets created by the user to be deleted
            const items = await Items.find({creator: res.locals.currentUser._id})

            // Loops through each result and deletes the document from the MongoDB database
            items.map(async item => {
                await item.remove()
            })
            
            // Deletes the user document from the MongoDB database
            await user.remove();

            // Creates a successful response
            res.status(201).json({
                success: true,
                data: ""
            })
        }
    } catch (err) {
        // Creates an unsuccessful response with a 500 error
        res.status(500).json({
            success: false,
            error: "Server Error"
        })
    }
}