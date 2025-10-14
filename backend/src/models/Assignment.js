const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  types: {
    type: String,
    enum: ['assignment', 'lab_report', 'presentation'],
    default: 'assignment'
  },
  courseCode: {
    type: String,
    required: true,
    maxlength: 8
  },
  courseTitle: {
    type: String,
    required: true,
    maxlength: 100
  },
  assignmentTitle: {
    type: String,
    required: true,
    maxlength: 150
  },
  detail: {
    type: String,
    required: true
  },
  date: {
    type: Date
  },
  intake: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intake'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }
}, {
  timestamps: true
});

// Indexes
assignmentSchema.index({ intake: 1, department: 1, section: 1 });
assignmentSchema.index({ date: 1 });
assignmentSchema.index({ courseCode: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);