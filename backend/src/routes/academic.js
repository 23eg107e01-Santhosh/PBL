const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createSection,
  getSections,
  updateSection,
  deleteSection,
  createIntake,
  getIntakes,
  updateIntake,
  deleteIntake
} = require('../controllers/academicController');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');

// DEPARTMENT ROUTES
// @route   POST /api/academic/departments
// @desc    Create department
// @access  Private (Admin/Teacher only)
router.post('/departments', 
  authenticate, 
  authorize('admin', 'teacher'),
  createDepartment
);

// @route   GET /api/academic/departments
// @desc    Get all departments
// @access  Private (All authenticated users)
router.get('/departments', 
  authenticate, 
  getDepartments
);

// @route   PUT /api/academic/departments/:id
// @desc    Update department
// @access  Private (Admin/Teacher only)
router.put('/departments/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  updateDepartment
);

// @route   DELETE /api/academic/departments/:id
// @desc    Delete department
// @access  Private (Admin/Teacher only)
router.delete('/departments/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  deleteDepartment
);

// SECTION ROUTES
// @route   POST /api/academic/sections
// @desc    Create section
// @access  Private (Admin/Teacher only)
router.post('/sections', 
  authenticate, 
  authorize('admin', 'teacher'),
  createSection
);

// @route   GET /api/academic/sections
// @desc    Get all sections
// @access  Private (All authenticated users)
router.get('/sections', 
  authenticate, 
  getSections
);

// @route   PUT /api/academic/sections/:id
// @desc    Update section
// @access  Private (Admin/Teacher only)
router.put('/sections/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  updateSection
);

// @route   DELETE /api/academic/sections/:id
// @desc    Delete section
// @access  Private (Admin/Teacher only)
router.delete('/sections/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  deleteSection
);

// INTAKE ROUTES
// @route   POST /api/academic/intakes
// @desc    Create intake
// @access  Private (Admin/Teacher only)
router.post('/intakes', 
  authenticate, 
  authorize('admin', 'teacher'),
  createIntake
);

// @route   GET /api/academic/intakes
// @desc    Get all intakes
// @access  Private (All authenticated users)
router.get('/intakes', 
  authenticate, 
  getIntakes
);

// @route   PUT /api/academic/intakes/:id
// @desc    Update intake
// @access  Private (Admin/Teacher only)
router.put('/intakes/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  updateIntake
);

// @route   DELETE /api/academic/intakes/:id
// @desc    Delete intake
// @access  Private (Admin/Teacher only)
router.delete('/intakes/:id', 
  authenticate, 
  authorize('admin', 'teacher'),
  deleteIntake
);

module.exports = router;