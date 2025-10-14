const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Department, Section } = require('../src/models/Academic');

const app = express();
app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test routes
app.get('/academic/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching departments'
    });
  }
});

app.get('/academic/sections', async (req, res) => {
  try {
    const sections = await Section.find().sort({ section: 1 });
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sections'
    });
  }
});

const startServer = async () => {
  await connectDB();
  
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Test departments: http://localhost:${PORT}/academic/departments`);
    console.log(`Test sections: http://localhost:${PORT}/academic/sections`);
  });
};

startServer();