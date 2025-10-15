const mongoose = require('mongoose');
require('dotenv').config();
const { Department } = require('../src/models/Academic');

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science and Engineering', description: 'Department of CSE' },
  { code: 'EEE', name: 'Electrical and Electronic Engineering', description: 'Department of EEE' },
  { code: 'ME',  name: 'Mechanical Engineering', description: 'Department of ME' },
  { code: 'BBA', name: 'Business Administration', description: 'Department of BBA' },
  { code: 'MATH', name: 'Mathematics', description: 'Department of Mathematics' },
  { code: 'PHYS', name: 'Physics', description: 'Department of Physics' }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding departments');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function populateDepartments(){
  let created = 0; let updated = 0;
  for (const d of DEPARTMENTS) {
    const exist = await Department.findOne({ code: d.code });
    if (exist) {
      if (exist.name !== d.name || exist.description !== d.description) {
        exist.name = d.name; exist.description = d.description; await exist.save(); updated++;
        console.log('🔄 Updated', d.code);
      } else {
        console.log('✓ Exists', d.code);
      }
    } else {
      await Department.create(d); created++; console.log('✅ Created', d.code);
    }
  }
  console.log(`Done. Created: ${created}, Updated: ${updated}`);
}

async function main(){
  await connectDB();
  await populateDepartments();
  await mongoose.connection.close();
  console.log('Database connection closed');
}

if (require.main === module) { main(); }

module.exports = { populateDepartments };