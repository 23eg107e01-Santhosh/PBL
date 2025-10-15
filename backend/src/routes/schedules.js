const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  getCalendarView
} = require('../controllers/scheduleController');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { scheduleValidation } = require('../middleware/validation');

// @route   POST /api/schedules
// @desc    Create schedule
// @access  Private (Teacher/Admin only)
router.post('/', 
  authenticate, 
  authorize('teacher', 'admin'),
  requireApproval,
  scheduleValidation, 
  createSchedule
);

// @route   GET /api/schedules
// @desc    Get all schedules (with filters)
// @access  Private (Approved users)
router.get('/', 
  authenticate, 
  requireApproval, 
  getSchedules
);

// @route   GET /api/schedules/calendar
// @desc    Get calendar view of schedules
// @access  Private (Approved users)
router.get('/calendar', 
  authenticate, 
  requireApproval, 
  getCalendarView
);

// @route   GET /api/schedules/:id
// @desc    Get schedule by ID
// @access  Private (Approved users)
router.get('/:id', 
  authenticate, 
  requireApproval, 
  getSchedule
);

// @route   PUT /api/schedules/:id
// @desc    Update schedule
// @access  Private (Owner/Admin only)
router.put('/:id', 
  authenticate, 
  requireApproval,
  scheduleValidation, 
  updateSchedule
);

// @route   DELETE /api/schedules/:id
// @desc    Delete schedule
// @access  Private (Owner/Admin only)
router.delete('/:id', 
  authenticate, 
  requireApproval,
  deleteSchedule
);

module.exports = router;
