const mongoose = require('mongoose');
require('dotenv').config();
const { Section } = require('../src/models/Academic');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const populateSections = async () => {
  try {
    // Clear existing sections
    await Section.deleteMany({});
    console.log('Cleared existing sections');

    // Create sections A through M
    const sections = [];
    for (let i = 0; i < 13; i++) {
      const sectionLetter = String.fromCharCode(65 + i); // A = 65, B = 66, etc.
      sections.push({
        section: sectionLetter,
        description: `Section ${sectionLetter}`
      });
    }

    // Insert all sections
    const createdSections = await Section.insertMany(sections);
    console.log(`Created ${createdSections.length} sections:`, createdSections.map(s => s.section).join(', '));

  } catch (error) {
    console.error('Error populating sections:', error);
  }
};

const main = async () => {
  await connectDB();
  await populateSections();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

main();