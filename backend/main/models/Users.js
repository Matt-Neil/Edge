const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: { 
        type: String, 
        required: true
    },
    password: { 
        type: String, 
        required: true
    },
    skill: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', UsersSchema);