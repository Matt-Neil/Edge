const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const UsersSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true
    },
    password: { 
        type: String, 
        required: true
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    projects: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    following: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    }
})

module.exports = mongoose.model('User', UsersSchema);