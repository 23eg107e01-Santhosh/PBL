const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  announcement: {
    type: String,
    required: true,
    maxlength: 500
  },
  image: {
    type: String // URL to uploaded image
  },
  file: {
    type: String // URL to uploaded file
  },
  whoPosted: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
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
  }
}, {
  timestamps: true
});

// Indexes
announcementSchema.index({ intake: 1, department: 1, section: 1 });
announcementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);