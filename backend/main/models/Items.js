const mongoose = require('mongoose');

const ExperimentsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    visibility: {
        type: Boolean,
        required: true
    },
    model: {
        type: [],
        required: true
    },
    configuration: {
        type: Object,
        required: true
    },
    updated: {
        type: Date,
        required: true
    }
}, {timestamps: true})

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

const ItemsSchema = new mongoose.Schema({
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
    deployed: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    experiments: {
        type: [ExperimentsSchema],
        required: false
    },
    dataset: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    datafile: {
        type: String,
        required: false
    },
    dataType: {
        type: String,
        required: false
    },
    updated: {
        type: Date,
        required: true
    },
    normalised: {
        type: Boolean,
        required: false
    },
    encoded: {
        type: Boolean,
        required: false
    },
    target: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Item', ItemsSchema);