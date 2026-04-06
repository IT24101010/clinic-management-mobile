const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },

        specialization: {
            type: String,
            required: [true, 'Specialization is required'],
            trim: true,
        },

        qualifications: {
            type: [String],
            default: [],
        },

        experience: {
            type: Number,
            required: [true, 'Experience is required'],
            min: [0, 'Experience cannot be negative'],
            max: [60, 'Experience seems unrealistic'], // optional limit
        },

        availableSlots: [
            {
                day: {
                    type: String,
                    required: true,
                },
                startTime: {
                    type: String,
                    required: true,
                },
                endTime: {
                    type: String,
                    required: true,
                },
            },
        ],

        consultationFee: {
            type: Number,
            required: true,
            min: [0, 'Consultation fee cannot be negative'],
        },

        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;