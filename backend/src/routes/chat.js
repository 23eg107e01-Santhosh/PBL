const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadChatSingle } = require('../middleware/upload');
const { ChatMessage } = require('../models');

// Fetch recent messages for a room
router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatMessage.find({ chatRoom: roomId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'email profile');
    
    // Format messages for frontend
    const formattedMessages = messages.reverse().map(msg => ({
      _id: msg._id,
      sender: msg.sender,
      chatRoom: msg.chatRoom,
      message: msg.message,
      messageType: msg.messageType,
      fileUrl: msg.fileUrl,
      fileName: msg.fileUrl ? msg.message : null,
      createdAt: msg.createdAt
    }));
    
    res.json({ success: true, data: { messages: formattedMessages } });
  } catch (e) {
    console.error('Get chat history error:', e);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
});

// Upload a chat file (20MB limit) and return its public URL
router.post('/upload', authenticate, (req, res) => {
  uploadChatSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    const f = req.file;
    if (!f) return res.status(400).json({ success: false, message: 'No file uploaded' });
    // Files are served from /uploads
    const fileUrl = `/uploads/${(f.fieldname === 'attachmentFile' ? 'attachments/' : '')}${f.filename}`;
    res.status(201).json({ success: true, data: { fileUrl, fileName: f.originalname } });
  });
});

module.exports = router;
