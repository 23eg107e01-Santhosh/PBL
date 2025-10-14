const { Room } = require('../models');

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const createRoom = async (req, res) => {
  try {
    const { title, description } = req.body;
    let code;
    // Ensure unique code
    do {
      code = generateCode();
    } while (await Room.findOne({ code }));

    const room = await Room.create({
      title,
      description: description || '',
      code,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json({ success: true, data: { room } });
  } catch (e) {
    console.error('Create room error:', e);
    res.status(500).json({ success: false, message: 'Server error creating room' });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const room = await Room.findOne({ code });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (!room.members.some(m => m.toString() === req.user._id.toString())) {
      room.members.push(req.user._id);
      await room.save();
    }
    res.json({ success: true, data: { room } });
  } catch (e) {
    console.error('Join room error:', e);
    res.status(500).json({ success: false, message: 'Server error joining room' });
  }
};

const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: { rooms } });
  } catch (e) {
    console.error('List rooms error:', e);
    res.status(500).json({ success: false, message: 'Server error fetching rooms' });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate({ path: 'createdBy', select: 'email role profile', populate: { path: 'profile', select: 'fullName' } })
      .populate({ path: 'members', select: 'email role profile', populate: { path: 'profile', select: 'fullName' } });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: { room } });
  } catch (e) {
    console.error('Get room error:', e);
    res.status(500).json({ success: false, message: 'Server error fetching room' });
  }
};

module.exports = { createRoom, joinRoom, getMyRooms, getRoom };
