const mongoose = require('mongoose');

const classAssignmentSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  instructions: { type: String, default: '' },
  // Optional list of questions; simple structure for Q&A style assignments
  questions: [{
    text: { type: String, required: true, maxlength: 1000 },
    // Optional correct answer (simple text match for auto-grading; teacher can override later)
    correctAnswer: { type: String, default: '' },
    points: { type: Number, default: 0 }
  }],
  // Optional explicit assignees. If empty or undefined, visible to all room members
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  dueDate: { type: Date },
  totalPoints: { type: Number, default: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ClassAssignment', classAssignmentSchema);
