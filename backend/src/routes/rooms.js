const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createRoom, joinRoom, getMyRooms, getRoom } = require('../controllers/roomController');

router.post('/create', authenticate, authorize('teacher'), createRoom);
router.post('/join', authenticate, joinRoom);
router.get('/', authenticate, getMyRooms);
router.get('/:id', authenticate, getRoom);

module.exports = router;
