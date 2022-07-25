const mongoose = require('mongoose');

const eventCreator = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },

    eventName: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    eventCategory: {
        type: String,
        required: true
    },
    eventAbout: {
        type: String,
        required: true
    },
    eventAttendees: {
        type: String,
        required: true
    },
    eventLocation: {
        type: String,
        required: true
    },
    eventFlyers: [],
    eventDate: {
        type: Date,
        required: true
    },
    eventSchedules: {
        type: String
    },
    eventVersion: {
        type: String,
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model('EventCreator', eventCreator);