const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Student, Department, Section, User, Profile } = require('../src/models');

const DEMO_STUDENTS = [
  // CSE Department
  { personalId: 'CSE21001', name: 'Ahmed Rahman', gender: 'male', department: 'CSE', section: 'A' },
  { personalId: 'CSE21002', name: 'Fatima Khan', gender: 'female', department: 'CSE', section: 'A' },
  { personalId: 'CSE21003', name: 'Mohammad Ali', gender: 'male', department: 'CSE', section: 'A' },
  { personalId: 'CSE21004', name: 'Nusrat Jahan', gender: 'female', department: 'CSE', section: 'B' },
  { personalId: 'CSE21005', name: 'Rashid Ahmed', gender: 'male', department: 'CSE', section: 'B' },
  { personalId: 'CSE21006', name: 'Sakina Begum', gender: 'female', department: 'CSE', section: 'B' },
  
  // EEE Department
  { personalId: 'EEE21001', name: 'Karim Hassan', gender: 'male', department: 'EEE', section: 'A' },
  { personalId: 'EEE21002', name: 'Ruma Khatun', gender: 'female', department: 'EEE', section: 'A' },
  { personalId: 'EEE21003', name: 'Sabbir Hossain', gender: 'male', department: 'EEE', section: 'B' },
  { personalId: 'EEE21004', name: 'Taslima Akter', gender: 'female', department: 'EEE', section: 'B' },
  
  // ME Department
  { personalId: 'ME21001', name: 'Mizanur Rahman', gender: 'male', department: 'ME', section: 'A' },
  { personalId: 'ME21002', name: 'Nasreen Sultana', gender: 'female', department: 'ME', section: 'A' },
  
  // BBA Department
  { personalId: 'BBA21001', name: 'Fahim Ahmed', gender: 'male', department: 'BBA', section: 'A' },
  { personalId: 'BBA21002', name: 'Shahana Parvin', gender: 'female', department: 'BBA', section: 'A' },
  { personalId: 'BBA21003', name: 'Tanvir Islam', gender: 'male', department: 'BBA', section: 'A' },
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

async function addDemoStudents() {
  try {
    console.log('Starting to add demo students...');
    
    // Get all departments and sections
    const departments = await Department.find({});
    const sections = await Section.find({});
    
    const departmentMap = {};
    const sectionMap = {};
    
    departments.forEach(dept => {
      departmentMap[dept.code] = dept._id;
    });
    
    sections.forEach(section => {
      sectionMap[section.section] = section._id;
    });
    
    console.log('Available departments:', Object.keys(departmentMap));
    console.log('Available sections:', Object.keys(sectionMap));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const studentData of DEMO_STUDENTS) {
      const departmentId = departmentMap[studentData.department];
      const sectionId = sectionMap[studentData.section];
      
      if (!departmentId) {
        console.log(`Department ${studentData.department} not found, skipping ${studentData.name}...`);
        errorCount++;
        continue;
      }
      
      if (!sectionId) {
        console.log(`Section ${studentData.section} not found, skipping ${studentData.name}...`);
        errorCount++;
        continue;
      }
      
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({ personalId: studentData.personalId });
        if (existingStudent) {
          console.log(`Student ${studentData.personalId} already exists, skipping...`);
          continue;
        }
        
        // Create user account
        const email = `${studentData.personalId.toLowerCase()}@student.university.edu`;
        const password = 'student123'; // Default password for demo
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            email,
            password,
            role: 'student'
          });
          await user.save();
        }
        
        // Create profile
        let profile = await Profile.findOne({ user: user._id });
        if (!profile) {
          profile = new Profile({
            user: user._id,
            detailsFilled: true,
            isApproved: true
          });
          await profile.save();
          
          // Update user with profile reference
          user.profile = profile._id;
          await user.save();
        }
        
        // Create student profile
        const student = new Student({
          account: profile._id,
          personalId: studentData.personalId,
          name: studentData.name,
          gender: studentData.gender,
          department: departmentId,
          section: sectionId,
          shift: 'Day',
          contactNumber: `01${Math.floor(Math.random() * 900000000 + 100000000)}`
        });
        
        await student.save();
        
        console.log(`✅ Added: ${studentData.name} (${studentData.personalId}) - ${studentData.department} Section ${studentData.section}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error adding student ${studentData.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Demo Student Creation Summary:`);
    console.log(`✅ Successfully created: ${successCount} students`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Display some statistics
    const totalStudents = await Student.countDocuments();
    console.log(`📈 Total students in database: ${totalStudents}`);
    
    // Show student distribution by department
    const studentsByDept = await Student.aggregate([
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
    
    console.log('\n📋 Students by Department:');
    studentsByDept.forEach(item => {
      console.log(`   ${item._id}: ${item.count} students`);
    });
    
  } catch (error) {
    console.error('Error adding demo students:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await addDemoStudents();
    console.log('\n🎉 Demo students added successfully!');
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

module.exports = { addDemoStudents };