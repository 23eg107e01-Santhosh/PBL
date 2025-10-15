const { Schedule, Academic } = require('../models');
const { validationResult } = require('express-validator');

const createSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      title, 
      description, 
      courseCode, 
      courseTitle, 
      startDate, 
      endDate, 
      timeSlots, 
      sections, 
      teacherId 
    } = req.body;

    const schedule = new Schedule({
      title,
      description,
      courseCode,
      courseTitle,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timeSlots,
      sections,
      teacherId: teacherId || req.user._id,
      createdBy: req.user._id
    });

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('sections', 'section')
      .populate('teacherId', 'email profile');

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: populatedSchedule
    });

  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating schedule'
    });
  }
};

const getSchedules = async (req, res) => {
  try {
    const { teacherId, section, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = {};
    if (teacherId) filter.teacherId = teacherId;
    if (section) filter.sections = section;

    const schedules = await Schedule.find(filter)
      .populate('sections', 'section')
      .populate('teacherId', 'email profile')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Schedule.countDocuments(filter);

    res.json({
      success: true,
      data: {
        schedules,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching schedules'
    });
  }
};

const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('sections', 'section')
      .populate('teacherId', 'email profile');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching schedule'
    });
  }
};

const updateSchedule = async (req, res) => {
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

    // Check if user owns this schedule or is admin
    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (schedule.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own schedules'
      });
    }

    // Handle date conversion
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate('sections', 'section')
    .populate('teacherId', 'email profile');

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule
    });

  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating schedule'
    });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (schedule.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own schedules'
      });
    }

    await Schedule.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting schedule'
    });
  }
};

const getCalendarView = async (req, res) => {
  try {
    const { startDate, endDate, teacherId } = req.query;
    
    const filter = {};
    if (teacherId) filter.teacherId = teacherId;
    if (startDate && endDate) {
      filter.$or = [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ];
    }

    const schedules = await Schedule.find(filter)
      .populate('sections', 'section')
      .populate('teacherId', 'email profile')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: schedules
    });

  } catch (error) {
    console.error('Get calendar view error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching calendar data'
    });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  getCalendarView
};
