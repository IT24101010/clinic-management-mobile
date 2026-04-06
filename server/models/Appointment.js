const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    date: {
        type: Date,
        required: true
    },
    timeSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    duration: {
        type: Number,
        default: 10
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    priorityFlag: {
        type: String,
        enum: ['normal', 'red'],
        default: 'normal'
    },
    tokenNumber: {
        type: Number
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
