const Workspaces = require('../models/Workspaces');
const Datasets = require('../models/Datasets');
const mongoose = require('mongoose');

exports.getSearch = async (req, res, next) => {
    try {
        const workspaces = await Workspaces.aggregate([
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
                    'creatorName.name': 1
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