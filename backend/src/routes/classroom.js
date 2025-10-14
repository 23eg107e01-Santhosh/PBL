const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { listPosts, createPost, listAssignments, createAssignment, submitWork, gradeSubmission } = require('../controllers/classroomController');

// Stream
router.get('/:roomId/posts', authenticate, listPosts);
router.post('/posts', authenticate, uploadFields, createPost);

// Classwork
router.get('/:roomId/assignments', authenticate, listAssignments);
router.post('/assignments', authenticate, authorize('teacher'), createAssignment);

// Submissions
router.post('/submissions', authenticate, uploadFields, submitWork);
router.post('/submissions/:submissionId/grade', authenticate, authorize('teacher'), gradeSubmission);

module.exports = router;
