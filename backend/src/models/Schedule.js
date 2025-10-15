const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  courseCode: { type: String, required: true, trim: true, maxlength: 16 },
  courseTitle: { type: String, required: true, trim: true, maxlength: 150 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeSlots: [{
    day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], required: false },
    startTime: { type: String }, // e.g., "08:00"
    endTime: { type: String },   // e.g., "09:15"
    room: { type: String, trim: true }
  }],
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

scheduleSchema.index({ teacherId: 1, startDate: 1 });
scheduleSchema.index({ 'sections': 1, startDate: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
