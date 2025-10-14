const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { ChatMessage } = require('../models');

// Fetch recent messages for a room
router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatMessage.find({ chatRoom: roomId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'email');
    res.json({ success: true, data: { messages: messages.reverse() } });
  } catch (e) {
    console.error('Get chat history error:', e);
    res.status(500).json({ success: false, message: 'Server error fetching messages' });
  }
});

module.exports = router;
