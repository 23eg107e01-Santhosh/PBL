const { Resource } = require('../models');
const fs = require('fs');
const path = require('path');

const uploadResource = async (req, res) => {
  try {
    const { roomId, linkUrl, description } = req.body;
    const files = req.files || {};

    let resource;
    if (files.resourceFile && files.resourceFile[0]) {
      const f = files.resourceFile[0];
      resource = await Resource.create({
        room: roomId,
        uploadedBy: req.user._id,
        type: 'file',
        fileUrl: `/uploads/resources/${f.filename}`,
        fileName: f.originalname,
        description: description || ''
      });
    } else if (linkUrl) {
      resource = await Resource.create({
        room: roomId,
        uploadedBy: req.user._id,
        type: 'link',
        linkUrl,
        description: description || ''
      });
    } else {
      return res.status(400).json({ success: false, message: 'No file or link provided' });
    }

    res.status(201).json({ success: true, data: { resource } });
  } catch (e) {
    console.error('Upload resource error:', e);
    res.status(500).json({ success: false, message: 'Server error uploading resource' });
  }
};

const listResources = async (req, res) => {
  try {
    const { roomId } = req.params;
    const resources = await Resource.find({ room: roomId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { resources } });
  } catch (e) {
    console.error('List resources error:', e);
    res.status(500).json({ success: false, message: 'Server error fetching resources' });
  }
};

module.exports = { uploadResource, listResources };
 
// Delete a resource (uploader or teacher/admin)
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Resource.findById(id).select('uploadedBy type fileUrl');
    if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });
    const isOwner = String(doc.uploadedBy) === String(req.user._id);
    const isStaff = req.user.role === 'teacher' || req.user.role === 'admin';
    if (!isOwner && !isStaff) return res.status(403).json({ success: false, message: 'Not allowed' });

    // Attempt to remove file from disk for file resources
    if (doc.type === 'file' && doc.fileUrl) {
      try {
        const rel = doc.fileUrl.replace(/^\//, '');
        const abs = path.join(__dirname, '../..', rel);
        fs.unlink(abs, () => {});
      } catch (_) { /* ignore file delete errors */ }
    }

    await Resource.findByIdAndDelete(id);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (e) {
    console.error('Delete resource error:', e);
    res.status(500).json({ success: false, message: 'Server error deleting resource' });
  }
};

module.exports.deleteResource = deleteResource;
