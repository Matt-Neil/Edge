const Items = require('../models/Items');
const mongoose = require('mongoose');

// Controller that finds all search results for a search phrase
exports.getSearch = async (req, res, next) => {
    try {
        // Fetches search results using the following query pipeline
        const items = await Items.aggregate([
            { 
                // Matches all documents in the items collection that both satisfy the text matching and is visible
                $match: { 
                    $text: { 
                        $search: req.query.phrase
                    },
                    visibility: true
                }
            // Populates the creator field with the user information
            }, { 
                $lookup: { 
                    from: "users", 
                    localField: "creator", 
                    foreignField: "_id", 
                    as: "creatorName" 
                }
            }, {
                // Deconstructs the creatorName array
                $unwind: "$creatorName"
            }, {
                // Specify the inclusion of fields
                $project: {
                    _id: 0,
                    "_id": 1,
                    "creator": 1,
                    "title": 1,
                    "picture": 1,
                    // Returns boolean if currently signed-in user has bookmarked a workspace or dataset
                    "bookmarks": { $in: [res.locals.currentUser._id, "$bookmarks"] },
                    // Returns boolean if currently signed-in user has upvoted a workspace or dataset
                    "upvoted": { $in: [res.locals.currentUser._id, "$upvotes"] },
                    // Returns the number of upvotes
                    "upvotes": { $size: "$upvotes" },
                    "updated": 1,
                    "createdAt": 1,
                    // Returns boolean if document ID is less than the most recently returned document for pagination
                    "page": { $lt: ["$_id", mongoose.Types.ObjectId(req.query.id)] },
                    "creatorName.name": 1,
                    "type": 1
                }
            }, {
                // Only document ID less than most recently returned document are forwarded
                $match: {
                    page: true
                }
            }, { 
                // Queried documents are ordered in descending order by ID
                $sort: { 
                    "_id": -1
                } 
            }   
        ]).limit(21);
    
        // Queried documents returned to front-end
        res.status(201).json({
            success: true,
            data: items
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Server Error"
        })
    }
}

exports.putUpvote = async (req, res, next) => {
    try {
        const item = await Items.findById(req.params.id);

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
        const item = await Items.findById(req.params.id);

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
        const item = await Items.findById(req.params.id);

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