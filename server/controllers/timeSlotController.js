const TimeSlot = require('../models/TimeSlot');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/DoctorProfile');

// @desc    Create new TimeSlot
// @route   POST /api/timeslots
// @access  Protected/Admin
const createTimeSlot = async (req, res, next) => {
    try {
        const { doctorId, date, startTime, endTime, maxCapacity, isActive } = req.body;
        const timeSlot = await TimeSlot.create({
            doctorId,
            date,
            startTime,
            endTime,
            maxCapacity,
            isActive
        });
        res.status(201).json(timeSlot);
    } catch (error) {
        next(error);
    }
};

// @desc    Get TimeSlots
// @route   GET /api/timeslots
// @access  Public or Protected
const getTimeSlots = async (req, res, next) => {
    try {
        const { date, doctorId } = req.query;
        let query = { isActive: true }; // Only show active slots by default to patients
        if (req.user && req.user.role === 'admin') {
            query = {}; // Admin sees all
        }
        if (date) query.date = date;
        if (doctorId) query.doctorId = doctorId;

        const timeSlots = await TimeSlot.find(query)
            .populate('doctorId', 'name')
            .sort({ date: 1, startTime: 1 });

        res.status(200).json(timeSlots);
    } catch (error) {
        next(error);
    }
};

// @desc    Update TimeSlot
// @route   PUT /api/timeslots/:id
// @access  Protected/Admin
const updateTimeSlot = async (req, res, next) => {
    try {
        const { maxCapacity, isActive, startTime, endTime } = req.body;
        let timeSlot = await TimeSlot.findById(req.params.id);

        if (!timeSlot) {
            return res.status(404).json({ success: false, message: 'TimeSlot not found' });
        }

        if (maxCapacity !== undefined && maxCapacity < timeSlot.currentBookings) {
            return res.status(400).json({
                success: false,
                message: `Capacity cannot be lower than current bookings (${timeSlot.currentBookings})`
            });
        }

        timeSlot = await TimeSlot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json(timeSlot);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete TimeSlot
// @route   DELETE /api/timeslots/:id
// @access  Protected/Admin
const deleteTimeSlot = async (req, res, next) => {
    try {
        const timeSlot = await TimeSlot.findById(req.params.id);
        if (!timeSlot) {
            return res.status(404).json({ success: false, message: 'TimeSlot not found' });
        }

        // Cascade delete appointments associated with this timeslot
        await Appointment.deleteMany({ timeSlotId: req.params.id });
        await TimeSlot.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'TimeSlot and corresponding appointments removed' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in doctor's TimeSlots
// @route   GET /api/timeslots/doctor/my
// @access  Protected/Doctor
const getMyDoctorTimeSlots = async (req, res, next) => {
    try {
        const { includePast } = req.query;
        let query = { doctorId: req.user._id };

        if (includePast !== 'true') {
            // By default only show upcoming slots (today onwards)
            query.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
        }

        const timeSlots = await TimeSlot.find(query)
            .sort({ date: 1, startTime: 1 });

        res.status(200).json(timeSlots);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTimeSlot,
    getTimeSlots,
    updateTimeSlot,
    deleteTimeSlot,
    getMyDoctorTimeSlots
};
