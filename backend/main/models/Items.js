const mongoose = require('mongoose');

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
    model: {
        type: [],
        required: false
    },
    configuration: {
        type: Object,
        required: false
    },
    dataset: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    imageFile: {
        type: String,
        required: false
    },
    updated: {
        type: Date,
        required: true
    },
    labels: {
        type: [],
        required: false
    },
    type: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Item', ItemsSchema);