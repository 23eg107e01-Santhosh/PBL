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

const deleteRoom = async (req, res) => {
  try {
    console.log('Delete room request:', req.params.id, 'User:', req.user._id, 'Role:', req.user.role);
    
    const room = await Room.findById(req.params.id);
    if (!room) {
      console.log('Room not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    console.log('Room found:', room.title, 'Created by:', room.createdBy);
    
    // Only room creator or admin can delete
    if (room.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log('Permission denied - user is not creator or admin');
      return res.status(403).json({ success: false, message: 'You can only delete rooms you created' });
    }
    
    await Room.findByIdAndDelete(req.params.id);
    console.log('Room deleted successfully');
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (e) {
    console.error('Delete room error:', e);
    res.status(500).json({ success: false, message: 'Server error deleting room' });
  }
};

module.exports = { createRoom, joinRoom, getMyRooms, getRoom, deleteRoom };
