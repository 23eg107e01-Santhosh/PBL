const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  fileName: { type: String, default: '' }
}, { _id: false });

const classPostSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, trim: true, maxlength: 2000 },
  attachments: [attachmentSchema]
}, { timestamps: true });

module.exports = mongoose.model('ClassPost', classPostSchema);
