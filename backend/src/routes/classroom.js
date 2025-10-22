const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { listPosts, createPost, listAssignments, createAssignment, submitWork, gradeSubmission, listSubmissions, getMySubmission, deleteAssignment } = require('../controllers/classroomController');

// Stream
router.get('/:roomId/posts', authenticate, listPosts);
router.post('/posts', authenticate, uploadFields, createPost);

// Classwork
router.get('/:roomId/assignments', authenticate, listAssignments);
router.post('/assignments', authenticate, authorize('teacher'), createAssignment);
router.get('/assignments/:assignmentId/submissions', authenticate, authorize('teacher'), listSubmissions);
router.get('/assignments/:assignmentId/mine', authenticate, getMySubmission);
router.delete('/assignments/:id', authenticate, authorize('teacher'), deleteAssignment);

// Submissions
router.post('/submissions', authenticate, uploadFields, submitWork);
router.post('/submissions/:submissionId/grade', authenticate, authorize('teacher'), gradeSubmission);

module.exports = router;
