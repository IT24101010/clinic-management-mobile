const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            enum: ['patient', 'doctor', 'admin'],
            default: 'patient'
        },
        riskLevel: {
            type: String,
            enum: ['Low', 'Medium', 'High', null],
            default: null
        },
        phone: String,
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        address: String,
        medicalHistory: [
            {
                condition: String,
                diagnosedDate: Date,
                notes: String
            }
        ],
        allergies: [String],
        emergencyContact: {
            name: String,
            phone: String
        },
        profileImage: {
            type: String,
            default: ''
        },
        bloodReports: [
            {
                fileName: String,
                uploadDate: {
                    type: Date,
                    default: Date.now
                },
                fileUrl: {
                    type: String,
                    required: true
                }
            }
        ],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                return ret;
            }
        }
    }
);

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
