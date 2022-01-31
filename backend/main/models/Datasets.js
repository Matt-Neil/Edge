const mongoose = require('mongoose');

const CommentsSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { _id : false, timestamps: true})

const DatasetsSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: { 
        type: String, 
        required: true,
        index: true,
        text: true
    },
    description: { 
        type: String, 
        required: true,
        index: true,
        text: true
    },
    picture: {
        type: String,
        required: true
    },
    upvotes: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    bookmarks: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    visibility: {
        type: Boolean,
        required: true
    },
    comments: {
        type: [CommentsSchema],
        required: true
    },
    data: {
        type: String,
        required: true
    },
    updated: {
        type: Date,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Dataset', DatasetsSchema);