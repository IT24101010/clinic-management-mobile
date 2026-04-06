const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        unique: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
        // e.g., Consultation, Laboratory, Dental, Radiology
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
        // in minutes
    },
    imageUrl: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
