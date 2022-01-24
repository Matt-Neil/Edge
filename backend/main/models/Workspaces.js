const mongoose = require('mongoose');

const ExperimentsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { _id: false })

const CommentsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { _id : false, timestamps: true})

const WorkspacesSchema = new mongoose.Schema({
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
    bookmarked: {
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
    deployed: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    experiments: {
        type: [ExperimentsSchema],
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

module.exports = mongoose.model('Workspace', WorkspacesSchema);