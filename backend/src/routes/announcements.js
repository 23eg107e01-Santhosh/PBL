const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements
} = require('../controllers/announcementController');
const { authenticate, authorize, requireApproval } = require('../middleware/auth');
const { announcementValidation } = require('../middleware/validation');
const { uploadFields } = require('../middleware/upload');

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private (CR/Admin/Teacher only)
router.post('/', 
  authenticate, 
  authorize('cr', 'admin', 'teacher'),
  requireApproval,
  uploadFields,
  announcementValidation, 
  createAnnouncement
);

// @route   GET /api/announcements
// @desc    Get all announcements (with filters)
// @access  Private (Approved users)
router.get('/', 
  authenticate, 
  requireApproval, 
  getAnnouncements
);

// @route   GET /api/announcements/my
// @desc    Get current user's announcements
// @access  Private (CR only)
router.get('/my', 
  authenticate, 
  authorize('cr'),
  requireApproval,
  getMyAnnouncements
);

// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Private (Approved users)
router.get('/:id', 
  authenticate, 
  requireApproval, 
  getAnnouncement
);

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Owner/Admin/Teacher only)
router.put('/:id', 
  authenticate, 
  requireApproval,
  uploadFields,
  announcementValidation, 
  updateAnnouncement
);

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Owner/Admin/Teacher only)
router.delete('/:id', 
  authenticate, 
  requireApproval,
  deleteAnnouncement
);

module.exports = router;