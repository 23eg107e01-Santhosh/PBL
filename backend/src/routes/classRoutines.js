const express = require('express');
const router = express.Router();
const {
  createClassRoutine,
  getClassRoutines,
  getClassRoutine,
  updateClassRoutine,
  deleteClassRoutine,
  getWeeklySchedule
} = require('../controllers/classRoutineController');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { classRoutineValidation } = require('../middleware/validation');

// @route   POST /api/class-routines
// @desc    Create class routine
// @access  Private (Admin/Teacher only)
router.post('/', 
  authenticate, 
  authorize('admin', 'teacher'),
  requireApproval,
  classRoutineValidation, 
  createClassRoutine
);

// @route   GET /api/class-routines
// @desc    Get all class routines (with filters)
// @access  Private (Approved users)
router.get('/', 
  authenticate, 
  requireApproval, 
  getClassRoutines
);

// @route   GET /api/class-routines/weekly
// @desc    Get weekly schedule for specific intake/department/section
// @access  Private (Approved users)
router.get('/weekly', 
  authenticate, 
  requireApproval, 
  getWeeklySchedule
);

// @route   GET /api/class-routines/:id
// @desc    Get class routine by ID
// @access  Private (Approved users)
router.get('/:id', 
  authenticate, 
  requireApproval, 
  getClassRoutine
);

// @route   PUT /api/class-routines/:id
// @desc    Update class routine
// @access  Private (Admin/Teacher only)
router.put('/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  requireApproval,
  classRoutineValidation, 
  updateClassRoutine
);

// @route   DELETE /api/class-routines/:id
// @desc    Delete class routine
// @access  Private (Admin/Teacher only)
router.delete('/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  requireApproval,
  deleteClassRoutine
);

module.exports = router;