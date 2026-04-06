const express = require('express');
const router = express.Router();
const {
    getAllServices,
    getAllServicesAdmin,
    getServiceById,
    createService,
    updateService,
    deleteService,
    hardDeleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllServicesAdmin);
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);
router.delete('/:id/hard', protect, authorize('admin'), hardDeleteService);

module.exports = router;
