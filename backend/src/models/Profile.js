const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 150
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  detailsFilled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Method to check if profile is fully filled
profileSchema.methods.isFullyFilled = function() {
  // Check if all required fields are filled
  return this.detailsFilled && this.isApproved;
};

module.exports = mongoose.model('Profile', profileSchema);