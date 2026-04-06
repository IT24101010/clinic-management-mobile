const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAllAnnouncements,
    getAllAnnouncementsAdmin,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    hardDeleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllAnnouncementsAdmin);
router.post('/', protect, authorize('admin'), createAnnouncement);
router.put('/:id', protect, authorize('admin'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);
router.delete('/:id/hard', protect, authorize('admin'), hardDeleteAnnouncement);

module.exports = router;
