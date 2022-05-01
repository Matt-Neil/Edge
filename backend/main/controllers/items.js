const Items = require('../models/Items');
const mongoose = require('mongoose');

// Controller finds all public workspaces and datasets
exports.getPublic = async (req, res, next) => {
    try {
        const items = await Items.aggregate([
            { 
                // Matches all workspaces or datasets that are public
                $match: {
                    visibility: true,
                    type: req.query.type
                }
            }, { 
                // Populates the creator field with the user information
                $lookup: { 
                    from: 'users', 
                    localField: 'creator', 
                    foreignField: '_id', 
                    as: 'creatorName' 
                }
            }, {
                // Deconstructs the creatorName array
                $unwind: '$creatorName'
            }, { 
                // Specify the inclusion of fields
                $project: {
                    _id: 0,
                    '_id': 1,
                    'creator': 1,
                    'title': 1,
                    'picture': 1,
                    'visibility': 1,
                    // Returns boolean if currently signed-in user has bookmarked a workspace or dataset
                    'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                    // Returns boolean if currently signed-in user has upvoted a workspace or dataset
                    'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                    // Returns the number of upvotes
                    'upvotes': { $size: '$upvotes' },
                    'updated': 1,
                    'createdAt': 1,
                    // Returns boolean if document ID is less than the most recently returned document for pagination
                    'page': { $lt: ['$createdAt', new Date(req.query.date)] },
                    'creatorName.name': 1,
                    'type': 1
                }
            }, {
                // Only document ID less than most recently returned document are forwarded
                $match: {
                    page: true
                }
            }, { 
                // Queried documents are ordered in descending order by creation date
                $sort: { 
                    'createdAt': -1
                } 
            }
        ]);
    
        // Queried documents returned to front-end
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

// Retrieves the information of a specific workspace or dataset
exports.getItem = async (req, res, next) => {
    try {
        let item 
        
        if (req.query.type === "dataset") {
            item = await Items.aggregate([
                { 
                    // Matches dataset that has the same ID specified
                    $match: {
                        _id: mongoose.Types.ObjectId(req.params.id)
                    }
                }, { 
                    // Populates the creator field with the user information
                    $lookup: { 
                        from: 'users', 
                        localField: 'creator', 
                        foreignField: '_id', 
                        as: 'creatorName' 
                    }
                }, {
                    // Deconstructs the creatorName array
                    $unwind: '$creatorName'
                }, { 
                    // Specify the inclusion of fields
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
                        // Check if the creator ID is the same as the currently signed-in user
                        'self': { $eq: [mongoose.Types.ObjectId(res.locals.currentUser._id), '$creator']},
                        // Returns boolean if currently signed-in user has bookmarked a workspace or dataset
                        'bookmarked': { $in: [res.locals.currentUser._id, '$bookmarks'] },
                        // Returns boolean if currently signed-in user has upvoted a workspace or dataset
                        'upvoted': { $in: [res.locals.currentUser._id, '$upvotes'] },
                        // Returns the number of upvotes
                        'upvotes': { $size: '$upvotes' },
                        'updated': 1,
                        'creatorName.name': 1,
                        'type': 1
                    }
                }, {
                    // Matches document only if the creator is requesting the dataset or it is public
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
                        // Matches workspace that has the same ID specified
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
                    // Matches document only if the creator is requesting the workspace or it is public
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

        // Returns workspace or dataset to the front-end
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


// Creates a new workspace or dataset using the information sent in the request body
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

// Updates a specific workspace or dataset
exports.putItem = async (req, res, next) => {
    try {
        // Finds the workspace or dataset that is to be updated
        const item = await Items.findById(req.params.id)
        
        // Checks if workspace or dataset has been found
        if (!item) {
            res.status(404).json({
                success: false,
                error: "No Item Found."
            })
        } else {
            // Updates all modifiable fields with their corresponding attribute in the request body
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
            
            // Saves updated document
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

// Checks if dataset is public and returns all fields necessary for managing a workspace
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

// Retrieves all workspaces that use a specified dataset
exports.getAssociatedWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Items.aggregate([
            { 
                // Matches all public workspaces that use a specified dataset
                $match: {
                    visibility: true,
                    dataset: mongoose.Types.ObjectId(req.query.id),
                    type: "workspace"
                }
            }, { 
                // Populates the creator field with the user information
                $lookup: { 
                    from: 'users', 
                    localField: 'creator', 
                    foreignField: '_id', 
                    as: 'creatorName' 
                }
            }, {
                // Deconstructs the creatorName array
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

// Deletes a specified workspace or dataset
exports.deleteItem = async (req, res, next) => {
    try {
        // Finds workspace or dataset to be deleted
        const item = await Items.findById(req.params.id)

        if (!item) {
            res.status(201).json({
                success: false,
                data: ""
            })
        } else {
            // Checks if the workspace or dataset creator matches the currently signed-in user
            if (item.creator === res.locals.currentUser._id) {
                // Deletes document from collection
                await item.remove()

                res.status(201).json({
                    success: true,
                    data: ""
                })
            } else {
                res.status(201).json({
                    success: false,
                    data: ""
                })
            }
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}