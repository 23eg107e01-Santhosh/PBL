const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassAssignment', required: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Optional structured answers for question-based assignments
  answers: [{
    questionIndex: { type: Number, min: 0 },
    answer: { type: String, default: '' }
  }],
  fileUrl: { type: String, default: '' },
  linkUrl: { type: String, default: '' },
  text: { type: String, default: '' },
  grade: { type: Number, default: null },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
