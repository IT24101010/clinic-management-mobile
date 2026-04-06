const express = require('express');
const router = express.Router();
const {
    getAllDoctors,
    getAllDoctorsAdmin,
    getDoctorById,
    createDoctorProfile,
    updateDoctorProfile,
    deleteDoctorProfile,
    getMyDoctorProfile,
    updateMyDoctorProfile,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { uploadImage } = require('../config/cloudinary');

// Doctor self-profile routes (must be before /:id)
router.get('/me', protect, authorize('doctor'), getMyDoctorProfile);
router.put('/me', protect, authorize('doctor'), updateMyDoctorProfile);

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected Admin routes
// Assuming 'Administrator' or 'admin' is the role name for admin users in your authorization setup
// We typically use 'admin' based on standard role names
router.get('/admin/all', protect, authorize('admin'), getAllDoctorsAdmin);
router.post('/', protect, authorize('admin'), createDoctorProfile);
router.put('/:id', protect, authorize('admin'), updateDoctorProfile);
router.delete('/:id', protect, authorize('admin'), deleteDoctorProfile);

router.post('/upload-image', protect, authorize('admin'), uploadImage.single('image'), (req, res) => {
    res.json({ imageUrl: req.file.path });
});

module.exports = router;
