const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { ClassRoutine, Department, Section, Student, Teacher, User, Profile } = require('../src/models');

const DEMO_SCHEDULES = [
  // Computer Science and Engineering (CSE) schedules
  {
    day: 'sat',
    time: '08:00AMto09:15AM',
    courseCode: 'CSE101',
    courseName: 'Programming Fundamentals',
    facultyShortName: 'MHR',
    facultyName: 'Dr. Mohammad Hassan Rahman',
    building: 1,
    room: 101,
    departmentCode: 'CSE',
    sections: ['A', 'B']
  },
  {
    day: 'sat',
    time: '09:15AMto10:30AM',
    courseCode: 'CSE201',
    courseName: 'Data Structures',
    facultyShortName: 'SIA',
    facultyName: 'Prof. Sultana Islam Ahmed',
    building: 1,
    room: 102,
    departmentCode: 'CSE',
    sections: ['A']
  },
  {
    day: 'sat',
    time: '09:15AMto10:30AM',
    courseCode: 'CSE102',
    courseName: 'Object Oriented Programming',
    facultyShortName: 'RAF',
    facultyName: 'Dr. Rafiul Alam Fahim',
    building: 1,
    room: 103,
    departmentCode: 'CSE',
    sections: ['B']
  },
  {
    day: 'sun',
    time: '08:00AMto09:15AM',
    courseCode: 'CSE301',
    courseName: 'Database Management Systems',
    facultyShortName: 'TAN',
    facultyName: 'Dr. Tanvir Ahmed Niloy',
    building: 1,
    room: 201,
    departmentCode: 'CSE',
    sections: ['A', 'B']
  },
  {
    day: 'sun',
    time: '10:30AMto11:45AM',
    courseCode: 'CSE401',
    courseName: 'Software Engineering',
    facultyShortName: 'MHR',
    facultyName: 'Dr. Mohammad Hassan Rahman',
    building: 1,
    room: 101,
    departmentCode: 'CSE',
    sections: ['A']
  },
  
  // Electrical and Electronics Engineering (EEE) schedules
  {
    day: 'sat',
    time: '08:00AMto09:15AM',
    courseCode: 'EEE101',
    courseName: 'Circuit Analysis',
    facultyShortName: 'KAR',
    facultyName: 'Dr. Kamrul Ahmed Rahman',
    building: 2,
    room: 101,
    departmentCode: 'EEE',
    sections: ['A', 'B']
  },
  {
    day: 'sat',
    time: '09:15AMto10:30AM',
    courseCode: 'EEE201',
    courseName: 'Digital Electronics',
    facultyShortName: 'SHA',
    facultyName: 'Prof. Shahida Haque',
    building: 2,
    room: 102,
    departmentCode: 'EEE',
    sections: ['A']
  },
  {
    day: 'mon',
    time: '08:00AMto09:15AM',
    courseCode: 'EEE301',
    courseName: 'Control Systems',
    facultyShortName: 'RAH',
    facultyName: 'Dr. Rahman Ahmed Hasan',
    building: 2,
    room: 201,
    departmentCode: 'EEE',
    sections: ['A', 'B']
  },

  // Mechanical Engineering (ME) schedules
  {
    day: 'sat',
    time: '08:00AMto09:15AM',
    courseCode: 'ME101',
    courseName: 'Engineering Mechanics',
    facultyShortName: 'JHA',
    facultyName: 'Dr. Jamal Hasan Ahmed',
    building: 3,
    room: 101,
    departmentCode: 'ME',
    sections: ['A']
  },
  {
    day: 'sun',
    time: '09:15AMto10:30AM',
    courseCode: 'ME201',
    courseName: 'Thermodynamics',
    facultyShortName: 'FIR',
    facultyName: 'Prof. Firoz Ahmed',
    building: 3,
    room: 102,
    departmentCode: 'ME',
    sections: ['A']
  },

  // Business Administration (BBA) schedules
  {
    day: 'sat',
    time: '08:00AMto09:15AM',
    courseCode: 'BBA101',
    courseName: 'Principles of Management',
    facultyShortName: 'NAZ',
    facultyName: 'Dr. Nazrul Islam',
    building: 4,
    room: 101,
    departmentCode: 'BBA',
    sections: ['A']
  },
  {
    day: 'sun',
    time: '10:30AMto11:45AM',
    courseCode: 'BBA201',
    courseName: 'Financial Accounting',
    facultyShortName: 'ROS',
    facultyName: 'Prof. Roshni Begum',
    building: 4,
    room: 102,
    departmentCode: 'BBA',
    sections: ['A']
  },

  // Common courses for multiple departments
  {
    day: 'mon',
    time: '08:00AMto09:15AM',
    courseCode: 'MATH101',
    courseName: 'Calculus I',
    facultyShortName: 'MAT',
    facultyName: 'Dr. Matiur Rahman',
    building: 5,
    room: 101,
    departmentCode: 'MATH',
    sections: ['A', 'B']
  },
  {
    day: 'tue',
    time: '09:15AMto10:30AM',
    courseCode: 'PHY101',
    courseName: 'Physics I',
    facultyShortName: 'PHY',
    facultyName: 'Dr. Physul Haque',
    building: 5,
    room: 201,
    departmentCode: 'PHYS',
    sections: ['A', 'B']
  },
  {
    day: 'wed',
    time: '10:30AMto11:45AM',
    courseCode: 'ENG101',
    courseName: 'English Composition',
    facultyShortName: 'ENG',
    facultyName: 'Prof. English Teacher',
    building: 5,
    room: 301,
    departmentCode: 'BBA', // Assigning to BBA as example
    sections: ['A']
  }
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

async function addDemoSchedules() {
  try {
    console.log('Starting to add demo schedules...');
    
    // Get all departments and sections
    const departments = await Department.find({});
    const sections = await Section.find({});
    
    const departmentMap = {};
    const sectionMap = {};
    
    departments.forEach(dept => {
      // Use code if available, fallback to shortName
      const key = dept.code || dept.shortName;
      if (key) {
        departmentMap[key] = dept._id;
      }
      console.log(`Department: ${dept.name} -> Key: ${key} -> ID: ${dept._id}`);
    });
    
    sections.forEach(section => {
      sectionMap[section.section] = section._id;
    });
    
    console.log('Available departments:', Object.keys(departmentMap));
    console.log('Available sections:', Object.keys(sectionMap));
    
    // Clear existing demo schedules
    await ClassRoutine.deleteMany({});
    console.log('Cleared existing schedules');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const schedule of DEMO_SCHEDULES) {
      const departmentId = departmentMap[schedule.departmentCode];
      
      if (!departmentId) {
        console.log(`Department ${schedule.departmentCode} not found, skipping...`);
        errorCount++;
        continue;
      }
      
      // Create schedule for each specified section
      for (const sectionCode of schedule.sections) {
        const sectionId = sectionMap[sectionCode];
        
        if (!sectionId) {
          console.log(`Section ${sectionCode} not found, skipping...`);
          errorCount++;
          continue;
        }
        
        try {
          const routineData = {
            day: schedule.day,
            time: schedule.time,
            courseCode: schedule.courseCode,
            facultyShortName: schedule.facultyShortName,
            building: schedule.building,
            room: schedule.room,
            department: departmentId,
            section: sectionId
            // intake is optional, so we're not including it
          };
          
          const classRoutine = new ClassRoutine(routineData);
          await classRoutine.save();
          
          console.log(`✅ Added: ${schedule.courseCode} - ${schedule.departmentCode} Section ${sectionCode} - ${schedule.day} ${schedule.time}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Error adding schedule for ${schedule.courseCode} - ${schedule.departmentCode} Section ${sectionCode}:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 Demo Schedule Creation Summary:`);
    console.log(`✅ Successfully created: ${successCount} schedules`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Display some statistics
    const totalSchedules = await ClassRoutine.countDocuments();
    console.log(`📈 Total schedules in database: ${totalSchedules}`);
    
    // Show schedule distribution by department
    const schedulesByDept = await ClassRoutine.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      {
        $unwind: '$dept'
      },
      {
        $group: {
          _id: '$dept.code',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    console.log('\n📋 Schedules by Department:');
    schedulesByDept.forEach(item => {
      console.log(`   ${item._id}: ${item.count} classes`);
    });
    
  } catch (error) {
    console.error('Error adding demo schedules:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await addDemoSchedules();
    console.log('\n🎉 Demo schedules added successfully!');
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { addDemoSchedules };