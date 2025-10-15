const mongoose = require('mongoose');
require('dotenv').config();

const { User, Profile, Room, ClassPost } = require('../src/models');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/versity_management');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

async function ensureTeacher(email, fullName){
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, password: 'teacher123', role: 'teacher' });
  }
  let profile = await Profile.findOne({ user: user._id });
  if (!profile) {
    profile = await Profile.create({ user: user._id, fullName, isApproved: true });
    user.profile = profile._id; await user.save();
  } else if (fullName && !profile.fullName) {
    profile.fullName = fullName; await profile.save();
  }
  return user;
}

async function addDemoClassrooms(){
  const teacher = await ensureTeacher('teacher.demo@university.edu', 'Demo Teacher');

  const roomsData = [
    { title: 'CSE 201 - Data Structures', description: 'Classroom for DS', code: 'CSE201A' },
    { title: 'EEE 101 - Circuit Analysis', description: 'EEE basics', code: 'EEE101A' }
  ];

  for (const r of roomsData) {
    const exist = await Room.findOne({ code: r.code });
    if (exist) { console.log('Room exists, skipping', r.code); continue; }
    const room = await Room.create({ ...r, createdBy: teacher._id, members: [teacher._id] });
    console.log('✅ Created room:', room.title);
    await ClassPost.create({ room: room._id, author: teacher._id, text: `Welcome to ${room.title}!` });
  }
}

async function main(){
  await connectDB();
  await addDemoClassrooms();
  await mongoose.connection.close();
  console.log('Database connection closed');
}

if (require.main === module) { main(); }

module.exports = { addDemoClassrooms };