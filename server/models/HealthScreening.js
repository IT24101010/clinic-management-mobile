const mongoose = require('mongoose');

const healthScreeningSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        gender: {
            type: Number,
            required: true,
            enum: [0, 1] // 0=female, 1=male
        },
        bmi: {
            type: Number,
            required: true
        },
        bpSystolic: {
            type: Number,
            required: true
        },
        bpDiastolic: {
            type: Number,
            required: true
        },
        glucose: {
            type: Number,
            required: true
        },
        cholesterol: {
            type: Number,
            required: true
        },
        exerciseChestPain: {
            type: Number,
            enum: [-1, 0, 1],
            default: -1,
        },
        riskLevel: {
            type: String,
            required: true,
            enum: ['Low', 'Medium', 'High']
        },
        confidence: {
            type: Number,
            required: true
        },
        reasons: {
            type: [String],
            default: []
        },
        diabetesProbability: {
            type: Number
        },
        heartDiseaseProbability: {
            type: Number
        },
        disclaimer: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const HealthScreening = mongoose.model('HealthScreening', healthScreeningSchema);

module.exports = HealthScreening;
