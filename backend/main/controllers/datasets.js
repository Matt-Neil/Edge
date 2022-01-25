const Datasets = require('../models/Datasets');
const Users = require('../models/Users');
const mongoose = require('mongoose');

exports.getAll = async (req, res, next) => {
    try {
        const datasets = await Datasets.aggregate([
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
                    'type': "dataset"
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
            data: datasets
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}