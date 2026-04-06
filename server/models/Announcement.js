const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Announcement content is required']
    },
    category: {
        type: String,
        enum: ['general', 'health-alert', 'holiday', 'campaign'],
        default: 'general'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'patients', 'doctors', 'high-risk'],
        default: 'all'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
