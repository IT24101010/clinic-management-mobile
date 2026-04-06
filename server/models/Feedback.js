const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true
    },
    sentimentScore: {
        type: Number
    },
    sentimentLabel: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
