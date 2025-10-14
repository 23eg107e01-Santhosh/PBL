const mongoose = require('mongoose');
require('dotenv').config();
const { Department, Section } = require('../src/models/Academic');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for checking');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkData = async () => {
  try {
    const departments = await Department.find({});
    const sections = await Section.find({});
    
    console.log('\n=== DEPARTMENTS ===');
    console.log(`Found ${departments.length} departments:`);
    departments.forEach(dept => {
      console.log(`- ${dept.name} (${dept.code})`);
    });
    
    console.log('\n=== SECTIONS ===');
    console.log(`Found ${sections.length} sections:`);
    sections.forEach(section => {
      console.log(`- Section ${section.section}`);
    });

  } catch (error) {
    console.error('Error checking data:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkData();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed');
  process.exit(0);
};

main();