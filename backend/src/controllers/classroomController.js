const { ClassPost, ClassAssignment, Submission, Room } = require('../models');

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
    if (!roomId) return res.status(400).json({ success: false, message: 'roomId required' });
    // Teachers see all assignments in the room. Students see ones assigned to them or to all.
    const filter = { room: roomId };
    if (req.user.role === 'student') {
      filter.$or = [
        { assignedTo: { $exists: false } },
        { assignedTo: { $size: 0 } },
        { assignedTo: req.user._id }
      ];
    }
    const assignments = await ClassAssignment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: { assignments } });
  } catch (e) {
    console.error('List assignments error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const createAssignment = async (req, res) => {
  try {
  const { room, title, instructions, dueDate, totalPoints, questions, assignedTo } = req.body;
    // Sanitize questions and assignees
    const qs = Array.isArray(questions)
      ? questions
          .filter(q => q && q.text)
          .map((q) => ({ text: String(q.text), correctAnswer: String(q.correctAnswer || ''), points: Number(q.points || 0) }))
      : [];
    let assignees = Array.isArray(assignedTo) ? assignedTo : [];
    // Ensure assignees are room members
    if (assignees.length) {
      const r = await Room.findById(room).select('members');
      if (!r) return res.status(404).json({ success: false, message: 'Room not found' });
      const memberSet = new Set(r.members.map(m => String(m)));
      assignees = assignees.filter(id => memberSet.has(String(id)));
    }
    const asg = await ClassAssignment.create({ room, title, instructions, dueDate, totalPoints, questions: qs, assignedTo: assignees, createdBy: req.user._id });
    res.status(201).json({ success: true, data: { assignment: asg } });
  } catch (e) {
    console.error('Create assignment error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submissions
const submitWork = async (req, res) => {
  try {
  const { assignment, linkUrl, text, answers } = req.body;
    // Check permission: if assignment has assignedTo, ensure current user is allowed
    const asg = await ClassAssignment.findById(assignment).select('assignedTo');
    if (!asg) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (Array.isArray(asg.assignedTo) && asg.assignedTo.length > 0) {
      const ok = asg.assignedTo.some(u => String(u) === String(req.user._id));
      if (!ok) return res.status(403).json({ success: false, message: 'Not assigned to you' });
    }
    const files = req.files || {};
    let fileUrl = '';
    if (files.submissionFile && files.submissionFile[0]) {
      const f = files.submissionFile[0];
      fileUrl = `/uploads/submissions/${f.filename}`;
    }
    let parsedAnswers = [];
    if (answers) {
      try {
        parsedAnswers = Array.isArray(answers) ? answers : JSON.parse(answers);
        parsedAnswers = parsedAnswers
          .filter((a) => a && (a.answer !== undefined && a.answer !== null))
          .map((a, i) => ({ questionIndex: Number(a.questionIndex ?? i), answer: String(a.answer) }));
      } catch(_) { parsedAnswers = []; }
    }
    // Auto-grade if correct answers exist
    let computedGrade = null;
    try {
      const fullAsg = await ClassAssignment.findById(assignment).select('questions totalPoints');
      if (fullAsg && Array.isArray(fullAsg.questions) && fullAsg.questions.length) {
        const sumPoints = fullAsg.questions.reduce((acc, q) => acc + Number(q.points || 0), 0);
        const total = Number(fullAsg.totalPoints || sumPoints || 100);
        let score = 0;
        for (const ans of parsedAnswers) {
          const q = fullAsg.questions[ans.questionIndex];
          if (!q) continue;
          const corr = (q.correctAnswer || '').toString().trim().toLowerCase();
          const got = (ans.answer || '').toString().trim().toLowerCase();
          if (corr && got && corr === got) {
            score += Number(q.points || 0);
          }
        }
        computedGrade = Math.max(0, Math.min(score, total));
      }
    } catch(_) {}

    const sub = await Submission.findOneAndUpdate(
      { assignment, student: req.user._id },
      { assignment, student: req.user._id, linkUrl: linkUrl || '', text: text || '', fileUrl, answers: parsedAnswers, ...(computedGrade !== null ? { grade: computedGrade } : {}) },
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

// List all submissions for an assignment (teacher only)
const listSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const subs = await Submission.find({ assignment: assignmentId })
      .populate({ path: 'student', select: 'email role profile', populate: { path: 'profile', select: 'fullName' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { submissions: subs } });
  } catch (e) {
    console.error('List submissions error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get my submission for an assignment
const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const sub = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    res.json({ success: true, data: { submission: sub } });
  } catch (e) {
    console.error('Get my submission error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { listPosts, createPost, listAssignments, createAssignment, submitWork, gradeSubmission, listSubmissions, getMySubmission };
 
// Delete an assignment (teacher who created it)
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const asg = await ClassAssignment.findById(id).select('createdBy');
    if (!asg) return res.status(404).json({ success: false, message: 'Assignment not found' });
    if (String(asg.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the creator can delete this assignment' });
    }
    await Submission.deleteMany({ assignment: id });
    await ClassAssignment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (e) {
    console.error('Delete assignment error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports.deleteAssignment = deleteAssignment;
