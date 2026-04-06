const express = require('express');
const router = express.Router();
const {
    screenPatient,
    getMyScreenings,
    getScreeningById,
    getAIModelInfo
} = require('../controllers/healthScreeningController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, screenPatient);
router.get('/my', protect, getMyScreenings);
router.get('/model-info', protect, authorize('admin'), getAIModelInfo);
router.get('/:id', protect, getScreeningById);

module.exports = router;
