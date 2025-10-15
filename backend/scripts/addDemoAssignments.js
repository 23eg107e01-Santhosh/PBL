const mongoose = require('mongoose');
require('dotenv').config();

const { Assignment, Department, Section, Intake } = require('../src/models');

const DEMO_ASSIGNMENTS = [
  { types: 'assignment', courseCode: 'CSE201', courseTitle: 'Data Structures', assignmentTitle: 'Stacks and Queues', detail: 'Implement stack and queue with arrays and linked lists.', daysFromNow: 7, dept: 'CSE', section: 'A' },
  { types: 'assignment', courseCode: 'CSE301', courseTitle: 'DBMS', assignmentTitle: 'ER Diagram', detail: 'Design ER diagram for a library system.', daysFromNow: 10, dept: 'CSE', section: 'B' },
  { types: 'lab_report', courseCode: 'EEE101', courseTitle: 'Circuit Analysis', assignmentTitle: 'Ohm’s Law Lab', detail: 'Submit lab report with measurements and graphs.', daysFromNow: 5, dept: 'EEE', section: 'A' },
  { types: 'presentation', courseCode: 'BBA201', courseTitle: 'Financial Accounting', assignmentTitle: 'Cash Flow Analysis', detail: 'Prepare a 10-slide presentation on cash flows.', daysFromNow: 14, dept: 'BBA', section: 'A' }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/versity_management');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function addDemoAssignments() {
  try {
    console.log('Seeding demo assignments...');

    const departments = await Department.find({});
    const sections = await Section.find({});
    const intakes = await Intake.find({}).sort({ intake: 1 });

    const deptMap = Object.fromEntries(departments.map(d => [d.code, d._id]));
    const sectionMap = Object.fromEntries(sections.map(s => [s.section, s._id]));
    const defaultIntakeId = intakes[0]?._id || null;

    let created = 0; let skipped = 0;
    for (const a of DEMO_ASSIGNMENTS) {
      const department = deptMap[a.dept];
      const section = sectionMap[a.section];
      if (!department || !section) { console.log('Missing dept/section for', a.assignmentTitle, 'skipping'); skipped++; continue; }

      const date = new Date();
      date.setDate(date.getDate() + a.daysFromNow);

      const doc = new Assignment({
        types: a.types,
        courseCode: a.courseCode,
        courseTitle: a.courseTitle,
        assignmentTitle: a.assignmentTitle,
        detail: a.detail,
        date,
        intake: defaultIntakeId,
        department,
        section
      });
      await doc.save();
      console.log(`✅ ${a.courseCode} - ${a.assignmentTitle} due ${date.toDateString()}`);
      created++;
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  }
}

async function main(){
  await connectDB();
  await addDemoAssignments();
  await mongoose.connection.close();
  console.log('Database connection closed');
}

if (require.main === module) {
  main();
}

module.exports = { addDemoAssignments };