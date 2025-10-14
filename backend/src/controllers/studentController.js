const { Student, Profile, User } = require('../models');
const { validationResult } = require('express-validator');

const createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { personalId, name, gender, intake, section, department, shift, contactNumber, facebookProfile } = req.body;

    // Check if personal ID already exists
    const existingStudent = await Student.findOne({ personalId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this personal ID already exists'
      });
    }

    // Create student profile
    const student = new Student({
      account: req.user.profile._id,
      personalId,
      name,
      gender,
      intake,
      section,
      department,
      shift,
      contactNumber,
      facebookProfile,
      image: req.file ? req.file.path : null
    });

    await student.save();

    // Update profile as details filled
    await Profile.findByIdAndUpdate(req.user.profile._id, {
      detailsFilled: true
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('intake')
      .populate('section')
      .populate('department');

    res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      data: populatedStudent
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating student profile'
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const { intake, section, department, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (intake) filter.intake = intake;
    if (section) filter.section = section;
    if (department) filter.department = department;

    const students = await Student.find(filter)
      .populate('intake')
      .populate('section')
      .populate('department')
      .populate('account')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: {
        students,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching students'
    });
  }
};

const getStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('intake')
      .populate('section')
      .populate('department')
      .populate('account');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student'
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if personalId is being updated and if it already exists
    if (updates.personalId) {
      const existingStudent = await Student.findOne({ 
        personalId: updates.personalId,
        _id: { $ne: id }
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Personal ID already in use'
        });
      }
    }

    if (req.file) {
      updates.image = req.file.path;
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate('intake')
    .populate('section')
    .populate('department');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating student'
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting student'
    });
  }
};

const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).populate('account');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Approve the profile
    await Profile.findByIdAndUpdate(student.account._id, {
      isApproved: true
    });

    res.json({
      success: true,
      message: 'Student approved successfully'
    });

  } catch (error) {
    console.error('Approve student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving student'
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ account: req.user.profile._id })
      .populate('intake')
      .populate('section')
      .populate('department');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Find current student profile
    const student = await Student.findOne({ account: req.user.profile._id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if personalId is being updated and if it already exists
    if (updates.personalId && updates.personalId !== student.personalId) {
      const existingStudent = await Student.findOne({ 
        personalId: updates.personalId,
        _id: { $ne: student._id }
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Personal ID already in use'
        });
      }
    }

    // Handle file upload
    if (req.file) {
      updates.image = req.file.path;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate('intake')
    .populate('section')
    .populate('department');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedStudent
    });

  } catch (error) {
    console.error('Update my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  approveStudent,
  getMyProfile,
  updateMyProfile
};