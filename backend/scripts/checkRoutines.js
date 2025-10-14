const mongoose = require('mongoose');
require('dotenv').config();
const { ClassRoutine, Department, Section } = require('../src/models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for testing routines');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testRoutines = async () => {
  try {
    // Get all existing routines
    const routines = await ClassRoutine.find({})
      .populate('department')
      .populate('section');
    
    console.log('\n=== ALL CLASS ROUTINES ===');
    console.log(`Found ${routines.length} routines:`);
    
    routines.forEach(routine => {
      console.log(`- Day: ${routine.day}, Time: ${routine.time}, Course: ${routine.courseCode}`);
      console.log(`  Faculty: ${routine.facultyShortName}, Room: ${routine.room}, Building: ${routine.building}`);
      console.log(`  Department: ${routine.department?.name}, Section: ${routine.section?.section}`);
      console.log(`  ID: ${routine._id}\n`);
    });

    // Get a sample department and section for testing
    const departments = await Department.find({}).limit(1);
    const sections = await Section.find({}).limit(1);
    
    if (departments.length > 0 && sections.length > 0) {
      console.log('\n=== SAMPLE DATA FOR TESTING ===');
      console.log(`Sample Department: ${departments[0].name} (${departments[0]._id})`);
      console.log(`Sample Section: ${sections[0].section} (${sections[0]._id})`);
    }

  } catch (error) {
    console.error('Error checking routines:', error);
  }
};

const main = async () => {
  await connectDB();
  await testRoutines();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

main();