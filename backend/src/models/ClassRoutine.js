const mongoose = require('mongoose');

const classRoutineSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
    required: true
  },
  time: {
    type: String,
    enum: [
      '08:00AMto09:15AM',
      '09:15AMto10:30AM',
      '10:30AMto11:45AM',
      '11:45AMto01:00PM',
      '01:30PMto02:45PM',
      '02:45PMto04:00PM',
      '04:00PMto05:15PM',
      '05:15PMto06:30PM'
    ],
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    maxlength: 8
  },
  facultyShortName: {
    type: String,
    required: true,
    maxlength: 5
  },
  building: {
    type: Number,
    required: true,
    min: 1
  },
  room: {
    type: Number,
    required: true,
    min: 1
  },
  intake: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intake',
    required: false
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
  }
}, {
  timestamps: true
});

// Unique constraint to prevent duplicate class schedules
classRoutineSchema.index(
  { day: 1, time: 1, department: 1, section: 1 }, 
  { unique: true }
);

// Indexes for better query performance
classRoutineSchema.index({ department: 1, section: 1 });
classRoutineSchema.index({ day: 1 });

module.exports = mongoose.model('ClassRoutine', classRoutineSchema);