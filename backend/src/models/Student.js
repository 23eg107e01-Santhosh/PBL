const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
  intake: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intake',
    required: false
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  shift: {
    type: String,
    enum: ['Day', 'Evening'],
    required: true
  },
  isClassCR: {
    type: Boolean,
    default: false
  },
  contactNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{10,15}/.test(v);
      },
      message: 'Contact number must be 10-15 digits'
    }
  },
  facebookProfile: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
studentSchema.index({ intake: 1, section: 1, department: 1 });

module.exports = mongoose.model('Student', studentSchema);