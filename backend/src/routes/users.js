const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/teachers
// @desc    Get all teachers
// @access  Private
router.get('/teachers', authenticate, async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher',
      isActive: true 
    }).select('email profile').populate('profile', 'firstName lastName fullName');

    // Format the response to include name and email
    const formattedTeachers = teachers.map(teacher => ({
      _id: teacher._id,
      email: teacher.email,
      name: teacher.profile?.fullName || teacher.profile?.firstName + ' ' + teacher.profile?.lastName || teacher.email,
      firstName: teacher.profile?.firstName,
      lastName: teacher.profile?.lastName
    }));

    res.json({
      success: true,
      data: formattedTeachers
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin/teacher only)
// @access  Private
router.get('/', authenticate, authorize(['admin', 'teacher']), async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .populate('profile')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;