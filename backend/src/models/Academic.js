const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 150
  },
  code: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true
  },
  description: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

const sectionSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    maxlength: 5
  },
  description: {
    type: String,
    maxlength: 100
  }
}, {
  timestamps: true
});

const intakeSchema = new mongoose.Schema({
  intake: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  }
}, {
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
const Section = mongoose.model('Section', sectionSchema);
const Intake = mongoose.model('Intake', intakeSchema);

module.exports = {
  Department,
  Section,
  Intake
};