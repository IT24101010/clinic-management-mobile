const Announcement = require('../models/Announcement');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res, next) => {
    try {
        const data = { ...req.body, createdBy: req.user._id };
        const announcement = await Announcement.create(data);
        res.status(201).json(announcement);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active announcements
// @route   GET /api/announcements
// @access  Public
const getAllAnnouncements = async (req, res, next) => {
    try {
        const { category } = req.query;
        let query = {
            isActive: true,
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: null },
                { expiryDate: { $gt: new Date() } }
            ]
        };

        if (category) {
            query.category = category;
        }

        let announcements = await Announcement.find(query).populate('createdBy', 'name');

        // Custom Sort: priority (high -> medium -> low), then publishDate (newest first)
        const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };

        announcements.sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 4;
            const priorityB = priorityOrder[b.priority] || 4;

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            // If same priority, sort by publishDate descending
            return new Date(b.publishDate) - new Date(a.publishDate);
        });

        res.status(200).json(announcements);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all announcements (active & inactive)
// @route   GET /api/announcements/admin/all
// @access  Private/Admin
const getAllAnnouncementsAdmin = async (req, res, next) => {
    try {
        const announcements = await Announcement.find({})
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(announcements);
    } catch (error) {
        next(error);
    }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncementById = async (req, res, next) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('createdBy', 'name');

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.status(200).json(announcement);
    } catch (error) {
        next(error);
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.status(200).json(announcement);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete announcement (Soft delete)
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        // Soft Delete
        announcement.isActive = false;
        await announcement.save();

        res.status(200).json({ success: true, message: 'Announcement successfully deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Hard Delete announcement (Permanent)
// @route   DELETE /api/announcements/:id/hard
// @access  Private/Admin
const hardDeleteAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Announcement permanently deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAnnouncement,
    getAllAnnouncements,
    getAllAnnouncementsAdmin,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    hardDeleteAnnouncement
};
