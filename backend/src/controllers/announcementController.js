const { Announcement, Student } = require('../models');
const { validationResult } = require('express-validator');

const createAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { announcement, intake, department, section } = req.body;

    // Get the student/CR who is posting
    const student = await Student.findOne({ account: req.user.profile._id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const newAnnouncement = new Announcement({
      announcement,
      image: req.files?.announcementImage?.[0]?.path || null,
      file: req.files?.announcementFile?.[0]?.path || null,
      whoPosted: student._id,
      intake,
      department,
      section
    });

    await newAnnouncement.save();

    const populatedAnnouncement = await Announcement.findById(newAnnouncement._id)
      .populate('whoPosted')
      .populate('intake')
      .populate('department')
      .populate('section');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: populatedAnnouncement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating announcement'
    });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const { intake, department, section, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (intake) filter.intake = intake;
    if (department) filter.department = department;
    if (section) filter.section = section;

    const announcements = await Announcement.find(filter)
      .populate('whoPosted')
      .populate('intake')
      .populate('department')
      .populate('section')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Announcement.countDocuments(filter);

    res.json({
      success: true,
      data: {
        announcements,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching announcements'
    });
  }
};

const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate('whoPosted')
      .populate('intake')
      .populate('department')
      .populate('section');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching announcement'
    });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if user owns this announcement (for CR/Student) or is admin/teacher
    const announcement = await Announcement.findById(id).populate('whoPosted');
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    const student = await Student.findOne({ account: req.user.profile._id });
    
    if (req.user.role === 'student' || req.user.role === 'cr') {
      if (!student || announcement.whoPosted._id.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own announcements'
        });
      }
    }

    // Handle file uploads
    if (req.files?.announcementImage?.[0]) {
      updates.image = req.files.announcementImage[0].path;
    }
    if (req.files?.announcementFile?.[0]) {
      updates.file = req.files.announcementFile[0].path;
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate('whoPosted')
    .populate('intake')
    .populate('department')
    .populate('section');

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating announcement'
    });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id).populate('whoPosted');
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check permissions
    const student = await Student.findOne({ account: req.user.profile._id });
    
    if (req.user.role === 'student' || req.user.role === 'cr') {
      if (!student || announcement.whoPosted._id.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own announcements'
        });
      }
    }

    await Announcement.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting announcement'
    });
  }
};

const getMyAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const student = await Student.findOne({ account: req.user.profile._id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const announcements = await Announcement.find({ whoPosted: student._id })
      .populate('whoPosted')
      .populate('intake')
      .populate('department')
      .populate('section')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Announcement.countDocuments({ whoPosted: student._id });

    res.json({
      success: true,
      data: {
        announcements,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get my announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your announcements'
    });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements
};