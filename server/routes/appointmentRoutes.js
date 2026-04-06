const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getMyAppointments,
    getAllAppointments,
    updateAppointment,
    deleteAppointment,
    getMyDoctorAppointments,
    getAppointmentsForTimeSlot,
    updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validated Routes

// Public or Patient targeted Routes
router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/:id', protect, updateAppointment);

// Protected Admin routes
router.get('/', protect, authorize('admin'), getAllAppointments);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

// Protected Doctor routes
router.get('/doctor/my', protect, authorize('doctor'), getMyDoctorAppointments);
router.get('/slot/:slotId', protect, authorize('doctor'), getAppointmentsForTimeSlot);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
