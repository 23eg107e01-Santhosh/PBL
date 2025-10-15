const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByType
} = require('../controllers/assignmentController');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { assignmentValidation } = require('../middleware/validation');

// @route   POST /api/assignments
// @desc    Create assignment
// @access  Private (Admin/Teacher/CR only)
router.post('/', 
  authenticate, 
  authorize('admin', 'teacher'),
  requireApproval,
  assignmentValidation, 
  createAssignment
);

// @route   GET /api/assignments
// @desc    Get all assignments (with filters)
// @access  Private (Approved users)
router.get('/', 
  authenticate, 
  requireApproval, 
  getAssignments
);

// @route   GET /api/assignments/by-type
// @desc    Get assignments grouped by type
// @access  Private (Approved users)
router.get('/by-type', 
  authenticate, 
  requireApproval, 
  getAssignmentsByType
);

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private (Approved users)
router.get('/:id', 
  authenticate, 
  requireApproval, 
  getAssignment
);

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Admin/Teacher/CR only)
router.put('/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  requireApproval,
  assignmentValidation, 
  updateAssignment
);

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Admin/Teacher only)
router.delete('/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  requireApproval,
  deleteAssignment
);

module.exports = router;