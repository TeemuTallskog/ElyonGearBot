const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-long')(mongoose);
const {Types: {Long}} = mongoose;

const eventSchema = new Schema({
    eventid: {
        type: String,
        required: true
    },
    messageid: {
        type: String,
        required: true
    },
    messagechannel: {
        type: Long,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    attendees: [{
        userid: Long,
        username: String,
        attending: Boolean
    }],
    
});

const CustomEvent = mongoose.model('CustomEvent', eventSchema);

module.exports = CustomEvent;