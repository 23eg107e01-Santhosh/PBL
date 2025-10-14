const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  personalId: {
    type: String,
    required: true,
    unique: true,
    maxlength: 150
  },
  name: {
    type: String,
    required: true,
    maxlength: 350
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  image: {
    type: String, // URL to uploaded image
    default: null
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  isIntakeIncharge: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
teacherSchema.index({ department: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);