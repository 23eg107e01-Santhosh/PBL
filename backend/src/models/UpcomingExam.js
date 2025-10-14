const mongoose = require('mongoose');

const upcomingExamSchema = new mongoose.Schema({
  intake: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intake',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  examName: {
    type: String,
    enum: ['Class Test', 'Quiz Test', 'Mid Term', 'Final Test'],
    required: true
  },
  courseName: {
    type: String,
    required: true,
    maxlength: 50
  },
  courseCode: {
    type: String,
    required: true,
    maxlength: 7
  },
  date: {
    type: Date,
    required: true
  },
  topic: {
    type: String,
    required: true,
    maxlength: 150
  },
  detail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
upcomingExamSchema.index({ intake: 1, department: 1, section: 1 });
upcomingExamSchema.index({ date: 1 });
upcomingExamSchema.index({ courseCode: 1 });

module.exports = mongoose.model('UpcomingExam', upcomingExamSchema);