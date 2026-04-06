const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (Patient/User)
const createFeedback = async (req, res, next) => {
    try {
        const { doctorId, serviceId, rating, comment, sentimentScore, sentimentLabel } = req.body;

        const feedback = await Feedback.create({
            patientId: req.user._id,
            doctorId,
            serviceId,
            rating,
            comment,
            sentimentScore,
            sentimentLabel
        });

        res.status(201).json(feedback);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Public
const getAllFeedback = async (req, res, next) => {
    try {
        const { doctorId, serviceId } = req.query;
        let query = {};

        if (doctorId) query.doctorId = doctorId;
        if (serviceId) query.serviceId = serviceId;

        const feedback = await Feedback.find(query)
            .populate('patientId', 'name')
            .populate('doctorId', 'name')
            .populate('serviceId', 'serviceName')
            .sort({ createdAt: -1 });

        res.status(200).json(feedback);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Public
const getFeedbackById = async (req, res, next) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
            .populate('patientId', 'name')
            .populate('doctorId', 'name')
            .populate('serviceId', 'serviceName');

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.status(200).json(feedback);
    } catch (error) {
        next(error);
    }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Author only)
const updateFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        // Check if user is the author
        if (feedback.patientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this feedback' });
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedFeedback);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        // Must be the author or an admin
        if (feedback.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this feedback' });
        }

        await feedback.deleteOne();

        res.status(200).json({ success: true, message: 'Feedback removed' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get average ratings per doctor
// @route   GET /api/feedback/stats
// @access  Public
const getAverageRatings = async (req, res, next) => {
    try {
        const stats = await Feedback.aggregate([
            {
                $match: { doctorId: { $ne: null } }
            },
            {
                $group: {
                    _id: '$doctorId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createFeedback,
    getAllFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    getAverageRatings
};
