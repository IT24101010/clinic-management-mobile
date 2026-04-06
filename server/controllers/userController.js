const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, phone, dateOfBirth, gender } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
            phone,
            dateOfBirth,
            gender
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Allow updating specific fields
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
            if (req.body.gender) user.gender = req.body.gender;
            if (req.body.address) user.address = req.body.address;
            if (req.body.medicalHistory) user.medicalHistory = req.body.medicalHistory;
            if (req.body.allergies) user.allergies = req.body.allergies;
            if (req.body.emergencyContact) user.emergencyContact = req.body.emergencyContact;

            // Update password if provided
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json(updatedUser);
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;
        const query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const count = await User.countDocuments(query);
        const users = await User.find(query)
            .limit(Number(limit))
            .skip(Number(limit) * (Number(page) - 1))
            .select('-password');

        res.json({
            users,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalUsers: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create user (Admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, phone, dateOfBirth, gender, riskLevel } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
            phone,
            dateOfBirth,
            gender,
            riskLevel: riskLevel || 'Low'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.phone = req.body.phone || user.phone;
            user.gender = req.body.gender || user.gender;
            user.riskLevel = req.body.riskLevel || user.riskLevel;

            if (req.body.isActive !== undefined) {
                user.isActive = req.body.isActive;
            }
            if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete own account (Patient self-delete)
// @route   DELETE /api/users/profile
// @access  Private/Patient
const deleteMyAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const Appointment = require('../models/Appointment');
        await Appointment.deleteMany({ patientId: user._id });
        await User.findByIdAndDelete(user._id);

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Cascade delete implementation for robust user destruction
            const Appointment = require('../models/Appointment');

            if (user.role === 'patient') {
                await Appointment.deleteMany({ patientId: user._id });
            } else if (user.role === 'doctor') {
                await Appointment.deleteMany({ doctorId: user._id });
                const TimeSlot = require('../models/TimeSlot');
                await TimeSlot.deleteMany({ doctorId: user._id });
            }

            await User.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'User removed' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    deleteMyAccount
};
