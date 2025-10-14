const mongoose = require('mongoose');

const classAssignmentSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  instructions: { type: String, default: '' },
  dueDate: { type: Date },
  totalPoints: { type: Number, default: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ClassAssignment', classAssignmentSchema);
