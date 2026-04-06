const express = require('express');
const router = express.Router();
const {
    createTimeSlot,
    getTimeSlots,
    updateTimeSlot,
    deleteTimeSlot,
    getMyDoctorTimeSlots
} = require('../controllers/timeSlotController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTimeSlots);
router.get('/doctor/my', protect, authorize('doctor'), getMyDoctorTimeSlots);
router.post('/', protect, authorize('admin'), createTimeSlot);
router.put('/:id', protect, authorize('admin'), updateTimeSlot);
router.delete('/:id', protect, authorize('admin'), deleteTimeSlot);

module.exports = router;
