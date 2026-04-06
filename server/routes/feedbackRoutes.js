const express = require('express');
const router = express.Router();
const {
    createFeedback,
    getAllFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    getAverageRatings
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/stats', getAverageRatings);
router.get('/', getAllFeedback);
router.get('/:id', getFeedbackById);

// Protected Patient routes
router.post('/', protect, createFeedback);
router.put('/:id', protect, updateFeedback);

// Protected Admin routes are implicit below
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
