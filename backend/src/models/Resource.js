const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['file', 'link'], required: true },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  linkUrl: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
