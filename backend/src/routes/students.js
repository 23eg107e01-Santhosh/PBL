const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  approveStudent,
  getMyProfile,
  updateMyProfile
} = require('../controllers/studentController');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { studentValidation } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

// @route   POST /api/students
// @desc    Create student profile
// @access  Private (Student only)
router.post('/', 
  authenticate, 
  authorize('student'),
  upload.single('profileImage'),
  studentValidation, 
  createStudent
);

// @route   GET /api/students
// @desc    Get all students (with filters)
// @access  Private (Approved users)
router.get('/', 
  authenticate, 
  requireApproval, 
  getStudents
);

// @route   GET /api/students/me
// @desc    Get current student's profile
// @access  Private (Student only)
router.get('/me', 
  authenticate, 
  authorize('student'),
  getMyProfile
);

// @route   PUT /api/students/me
// @desc    Update current student's profile
// @access  Private (Student only)
router.put('/me', 
  authenticate, 
  authorize('student'),
  upload.single('profileImage'),
  updateMyProfile
);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (Approved users)
router.get('/:id', 
  authenticate, 
  requireApproval, 
  getStudent
);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin/Teacher or own profile)
router.put('/:id', 
  authenticate, 
  upload.single('profileImage'),
  studentValidation, 
  updateStudent
);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin/Teacher only)
router.delete('/:id', 
  authenticate, 
  authorize('admin', 'teacher'), 
  deleteStudent
);

// @route   POST /api/students/:id/approve
// @desc    Approve student
// @access  Private (Admin/Teacher only)
router.post('/:id/approve', 
  authenticate, 
  authorize('admin', 'teacher'), 
  approveStudent
);

module.exports = router;