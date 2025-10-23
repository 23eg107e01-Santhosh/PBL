const { Resource } = require('../models');

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
