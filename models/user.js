const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userid: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    gearscore:{
        type: Number,
        required: true
    },
    class:{
        type: String,
        required: true
    },
    level:{
        type: Number,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    lclass:{
        type: String,
        required: true
    },
    link:{
        type: String,
        required: false
    },
}, {timestamps: true});

const User = mongoose.model('Usergear', userSchema);

module.exports = User;