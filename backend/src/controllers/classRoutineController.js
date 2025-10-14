const { ClassRoutine } = require('../models');
const { validationResult } = require('express-validator');

const createClassRoutine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { day, time, courseCode, facultyShortName, building, room, intake, department, section } = req.body;

    // Check for existing routine conflict
    const filter = { day, time, department, section };
    if (intake) {
      filter.intake = intake;
    }
    
    const existingRoutine = await ClassRoutine.findOne(filter);

    if (existingRoutine) {
      return res.status(400).json({
        success: false,
        message: 'A class routine already exists for this day and time slot'
      });
    }

    const routineData = {
      day,
      time,
      courseCode,
      facultyShortName,
      building,
      room,
      department,
      section
    };
    
    if (intake) {
      routineData.intake = intake;
    }

    const classRoutine = new ClassRoutine(routineData);

    await classRoutine.save();

    const populatedRoutine = await ClassRoutine.findById(classRoutine._id)
      .populate('intake')
      .populate('department')
      .populate('section');

    res.status(201).json({
      success: true,
      message: 'Class routine created successfully',
      data: populatedRoutine
    });

  } catch (error) {
    console.error('Create class routine error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate class routine entry'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating class routine'
    });
  }
};

const getClassRoutines = async (req, res) => {
  try {
    const { intake, department, section, day, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = {};
    if (intake) filter.intake = intake;
    if (department) filter.department = department;
    if (section) filter.section = section;
    if (day) filter.day = day;

    const routines = await ClassRoutine.find(filter)
      .populate('intake')
      .populate('department')
      .populate('section')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ day: 1, time: 1 });

    const total = await ClassRoutine.countDocuments(filter);

    res.json({
      success: true,
      data: {
        routines,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get class routines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching class routines'
    });
  }
};

const getClassRoutine = async (req, res) => {
  try {
    const { id } = req.params;

    const routine = await ClassRoutine.findById(id)
      .populate('intake')
      .populate('department')
      .populate('section');

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Class routine not found'
      });
    }

    res.json({
      success: true,
      data: routine
    });

  } catch (error) {
    console.error('Get class routine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching class routine'
    });
  }
};

const updateClassRoutine = async (req, res) => {
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

    // Check for conflicts if time/day is being updated
    if (updates.day || updates.time) {
      const currentRoutine = await ClassRoutine.findById(id);
      const checkDay = updates.day || currentRoutine.day;
      const checkTime = updates.time || currentRoutine.time;

      const conflictingRoutine = await ClassRoutine.findOne({
        day: checkDay,
        time: checkTime,
        intake: updates.intake || currentRoutine.intake,
        department: updates.department || currentRoutine.department,
        section: updates.section || currentRoutine.section,
        _id: { $ne: id }
      });

      if (conflictingRoutine) {
        return res.status(400).json({
          success: false,
          message: 'Another class routine exists for this day and time slot'
        });
      }
    }

    const routine = await ClassRoutine.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate('intake')
    .populate('department')
    .populate('section');

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Class routine not found'
      });
    }

    res.json({
      success: true,
      message: 'Class routine updated successfully',
      data: routine
    });

  } catch (error) {
    console.error('Update class routine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating class routine'
    });
  }
};

const deleteClassRoutine = async (req, res) => {
  try {
    const { id } = req.params;

    const routine = await ClassRoutine.findByIdAndDelete(id);
    
    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Class routine not found'
      });
    }

    res.json({
      success: true,
      message: 'Class routine deleted successfully'
    });

  } catch (error) {
    console.error('Delete class routine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting class routine'
    });
  }
};

const getWeeklySchedule = async (req, res) => {
  try {
    const { intake, department, section } = req.query;

    if (!department || !section) {
      return res.status(400).json({
        success: false,
        message: 'Department and section are required'
      });
    }

    // Build filter - intake is optional
    const filter = { department, section };
    if (intake) {
      filter.intake = intake;
    }

    const routines = await ClassRoutine.find(filter)
    .populate('intake')
    .populate('department')
    .populate('section')
    .sort({ day: 1, time: 1 });

    // Organize by days
    const schedule = {
      sat: [],
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: []
    };

    routines.forEach(routine => {
      schedule[routine.day].push(routine);
    });

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Get weekly schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching weekly schedule'
    });
  }
};

module.exports = {
  createClassRoutine,
  getClassRoutines,
  getClassRoutine,
  updateClassRoutine,
  deleteClassRoutine,
  getWeeklySchedule
};