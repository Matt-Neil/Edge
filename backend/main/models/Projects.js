const mongoose = require('mongoose');

const ExperimentsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const ProjectsSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: { 
        type: String, 
        required: true
    },
    description: { 
        type: String, 
        required: true
    },
    visibility: {
        type: Boolean,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    upvotes: {
        type: Number,
        required: true
    },
    data: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    experiments: {
        type: [ExperimentsSchema],
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Project', ProjectsSchema);