const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./utils/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const assignmentRoutes = require('./routes/assignments');
const scheduleRoutes = require('./routes/schedules');
const academicRoutes = require('./routes/academic');
const chatRoutes = require('./routes/chat');
const roomRoutes = require('./routes/rooms');
const resourceRoutes = require('./routes/resources');
const classroomRoutes = require('./routes/classroom');

const app = express();

// Connect to database
connectDB();

// Trust proxy - this is needed for rate limiting when behind a proxy
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for local development if needed
  skip: process.env.NODE_ENV === 'development' ? (req) => req.ip === '::1' || req.ip === '127.0.0.1' : undefined
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(limiter);
// CORS configuration - allow Angular dev server (4200) and optionally legacy 3000
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:4200'
];
// Debug helper to see incoming origins
app.use((req, res, next) => {
  if (req.headers.origin && process.env.DEBUG_CORS) {
    console.log('CORS debug incoming origin:', req.headers.origin, 'path:', req.path);
  }
  next();
});
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.DEBUG_CORS) {
      console.warn('CORS blocked origin:', origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
  exposedHeaders: ['Content-Type','Authorization']
}));

// Manual preflight fallback (some proxies strip auto handling)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    return res.sendStatus(204);
  }
  return res.sendStatus(403);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Study Collab API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large'
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Allowed Clients: ${allowedOrigins.join(', ')}`);
});

// Socket.io setup for real-time features
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET','POST']
  }
});

// Socket.io connection handling for room chat
const { ChatMessage } = require('./models');
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  let joinedRoom = null;
  let joinedUserId = null;

  // Join a specific room by ID/code
  socket.on('joinRoom', ({ roomId, userId }) => {
    if (!roomId) return;
    socket.join(roomId);
    joinedRoom = roomId;
    joinedUserId = userId;
    socket.to(roomId).emit('userJoined', { userId, timestamp: Date.now() });
  });

  // Send message to a room
  socket.on('message', async ({ roomId, senderId, text }) => {
    if (!roomId || !senderId || !text) return;
    // Persist
    const msg = await ChatMessage.create({ sender: senderId, chatRoom: roomId, message: text, messageType: 'text' });
    // Broadcast
    io.to(roomId).emit('message', {
      _id: msg._id,
      sender: senderId,
      chatRoom: roomId,
      message: text,
      createdAt: msg.createdAt
    });
  });

  // Typing indicator
  socket.on('typing', ({ roomId, userId, isTyping }) => {
    if (!roomId || !userId) return;
    socket.to(roomId).emit('typing', { userId, isTyping: !!isTyping, timestamp: Date.now() });
  });

  // File message broadcast (client uploads via HTTP then emits this with URL)
  socket.on('fileUpload', async ({ roomId, senderId, fileUrl, fileName }) => {
    if (!roomId || !senderId || !fileUrl) return;
    try {
      // Persist as a chat message with attachment
      const msg = await ChatMessage.create({ 
        sender: senderId, 
        chatRoom: roomId, 
        message: fileName || 'File', 
        messageType: 'file', 
        fileUrl 
      });
      
      // Broadcast to all clients in the room
      io.to(roomId).emit('fileUpload', {
        _id: msg._id,
        sender: senderId,
        chatRoom: roomId,
        message: fileName || 'File',
        messageType: 'file',
        fileUrl,
        fileName: fileName || null,
        createdAt: msg.createdAt
      });
    } catch (error) {
      console.error('Error saving file message:', error);
      socket.emit('error', { message: 'Failed to save file message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (joinedRoom && joinedUserId) {
      socket.to(joinedRoom).emit('userLeft', { userId: joinedUserId, timestamp: Date.now() });
    }
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;