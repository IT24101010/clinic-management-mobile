const Service = require('../models/Service');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res, next) => {
    try {
        const services = await Service.find({ isActive: true });
        res.status(200).json(services);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all services (including inactive)
// @route   GET /api/services/admin/all
// @access  Private/Admin
const getAllServicesAdmin = async (req, res, next) => {
    try {
        const services = await Service.find({});
        res.status(200).json(services);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json(service);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res, next) => {
    try {
        const { serviceName, category, description, price, duration, imageUrl, isActive } = req.body;

        const serviceExists = await Service.findOne({ serviceName });

        if (serviceExists) {
            return res.status(400).json({ success: false, message: 'Service with this name already exists' });
        }

        const service = await Service.create({
            serviceName,
            category,
            description,
            price,
            duration,
            imageUrl,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Check if name is being changed to an existing name
        if (req.body.serviceName && req.body.serviceName !== service.serviceName) {
            const nameExists = await Service.findOne({ serviceName: req.body.serviceName });
            if (nameExists) {
                return res.status(400).json({ success: false, message: 'Another service with this name already exists' });
            }
        }

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedService);
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete a service (set isActive to false)
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        service.isActive = false;
        await service.save();

        res.status(200).json({ success: true, message: 'Service successfully deactivated (soft delete)' });
    } catch (error) {
        next(error);
    }
};

// @desc    Hard delete a service
// @route   DELETE /api/services/:id/hard
// @access  Private/Admin
const hardDeleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        await Service.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Service successfully deleted permanently' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllServices,
    getAllServicesAdmin,
    getServiceById,
    createService,
    updateService,
    deleteService,
    hardDeleteService
};
