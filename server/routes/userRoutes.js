const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const User = require('../models/User');
const { uploadImage, uploadDocument } = require('../config/cloudinary');

const {
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
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

// Validation Rules
const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);

router.post('/upload-avatar', protect, uploadImage.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.profileImage = req.file.path;
        await user.save();
        res.json({ imageUrl: req.file.path, user });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading avatar', error: error.message });
    }
});

router.post('/upload-report', protect, uploadDocument.single('report'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newReport = {
            fileUrl: req.file.path,
            fileName: req.file.originalname,
            uploadDate: new Date()
        };

        user.bloodReports.push(newReport);
        await user.save();

        res.json(newReport);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading report', error: error.message });
    }
});

router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, authorize('patient'), deleteMyAccount);

router
    .route('/')
    .post(protect, authorize('admin'), createUser)
    .get(protect, authorize('admin'), getAllUsers);

router
    .route('/:id')
    .get(protect, authorize('admin'), getUserById)
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
