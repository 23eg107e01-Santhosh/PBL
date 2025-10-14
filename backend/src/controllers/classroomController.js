const { ClassPost, ClassAssignment, Submission } = require('../models');

// Stream posts
const listPosts = async (req, res) => {
  try {
    const { roomId } = req.params;
    const posts = await ClassPost.find({ room: roomId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { posts } });
  } catch (e) {
    console.error('List posts error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const createPost = async (req, res) => {
  try {
    const { room, text } = req.body;
    const files = req.files || {};
    const attachments = [];
    if (files.attachmentFile) {
      for (const f of files.attachmentFile) {
        attachments.push({ fileUrl: `/uploads/attachments/${f.filename}`, fileName: f.originalname });
      }
    }
    const post = await ClassPost.create({ room, author: req.user._id, text, attachments });
    res.status(201).json({ success: true, data: { post } });
  } catch (e) {
    console.error('Create post error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Assignments
const listAssignments = async (req, res) => {
  try {
    const { roomId } = req.params;
    const assignments = await ClassAssignment.find({ room: roomId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { assignments } });
  } catch (e) {
    console.error('List assignments error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const createAssignment = async (req, res) => {
  try {
    const { room, title, instructions, dueDate, totalPoints } = req.body;
    const asg = await ClassAssignment.create({ room, title, instructions, dueDate, totalPoints, createdBy: req.user._id });
    res.status(201).json({ success: true, data: { assignment: asg } });
  } catch (e) {
    console.error('Create assignment error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submissions
const submitWork = async (req, res) => {
  try {
    const { assignment, linkUrl, text } = req.body;
    const files = req.files || {};
    let fileUrl = '';
    if (files.submissionFile && files.submissionFile[0]) {
      const f = files.submissionFile[0];
      fileUrl = `/uploads/submissions/${f.filename}`;
    }
    const sub = await Submission.findOneAndUpdate(
      { assignment, student: req.user._id },
      { assignment, student: req.user._id, linkUrl: linkUrl || '', text: text || '', fileUrl },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, data: { submission: sub } });
  } catch (e) {
    console.error('Submit work error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade } = req.body;
    const sub = await Submission.findByIdAndUpdate(submissionId, { grade, gradedBy: req.user._id }, { new: true });
    res.json({ success: true, data: { submission: sub } });
  } catch (e) {
    console.error('Grade submission error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { listPosts, createPost, listAssignments, createAssignment, submitWork, gradeSubmission };
