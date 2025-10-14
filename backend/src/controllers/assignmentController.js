const { Assignment } = require('../models');
const { validationResult } = require('express-validator');

const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { types, courseCode, courseTitle, assignmentTitle, detail, date, intake, department, section } = req.body;

    const assignment = new Assignment({
      types,
      courseCode,
      courseTitle,
      assignmentTitle,
      detail,
      date: date ? new Date(date) : null,
      intake,
      department,
      section
    });

    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('intake')
      .populate('department')
      .populate('section');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: populatedAssignment
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating assignment'
    });
  }
};

const getAssignments = async (req, res) => {
  try {
    const { intake, department, section, types, courseCode, upcoming, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (intake) filter.intake = intake;
    if (department) filter.department = department;
    if (section) filter.section = section;
    if (types) filter.types = types;
    if (courseCode) filter.courseCode = new RegExp(courseCode, 'i');
    
    // Filter for upcoming assignments only
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }

    const assignments = await Assignment.find(filter)
      .populate('intake')
      .populate('department')
      .populate('section')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1, createdAt: -1 });

    const total = await Assignment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assignments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignments'
    });
  }
};

const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate('intake')
      .populate('department')
      .populate('section');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });

  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignment'
    });
  }
};

const updateAssignment = async (req, res) => {
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

    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate('intake')
    .populate('department')
    .populate('section');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating assignment'
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting assignment'
    });
  }
};

const getAssignmentsByType = async (req, res) => {
  try {
    const { intake, department, section } = req.query;

    if (!intake || !department || !section) {
      return res.status(400).json({
        success: false,
        message: 'Intake, department, and section are required'
      });
    }

    const assignmentTypes = await Assignment.aggregate([
      {
        $match: {
          intake: mongoose.Types.ObjectId(intake),
          department: mongoose.Types.ObjectId(department),
          section: mongoose.Types.ObjectId(section)
        }
      },
      {
        $group: {
          _id: '$types',
          count: { $sum: 1 },
          assignments: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: assignmentTypes
    });

  } catch (error) {
    console.error('Get assignments by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching assignments by type'
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByType
};