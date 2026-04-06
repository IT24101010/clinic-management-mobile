const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    currentBookings: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual property for status
timeSlotSchema.virtual('status').get(function () {
    if (!this.isActive) return 'closed';
    if (this.currentBookings >= this.maxCapacity) return 'full';
    return 'open';
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
