const Datasets = require('../models/Datasets');
const Workspaces = require('../models/Workspaces');
const mongoose = require('mongoose');

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
                    'bookmarks': { $in: [res.locals.currentUser._id, '$bookmarks'] },
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
                    'bookmarks': { $in: [res.locals.currentUser._id, '$bookmarks'] },
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