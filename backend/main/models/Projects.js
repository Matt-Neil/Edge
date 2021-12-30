const mongoose = require('mongoose');

const ModelsSchema = new mongoose.Schema({
    epoch: {
        type: Number,
        required: true
    }
}, { _id : false })

const ProjectsSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: { 
        type: String, 
        required: true
    },
    data: { 
        type: [], 
        required: true
    },
    model: { 
        type: [ModelsSchema], 
        required: true
    }
})

module.exports = mongoose.model('Project', ProjectsSchema);