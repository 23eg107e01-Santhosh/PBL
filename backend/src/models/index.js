const User = require('./User');
const Profile = require('./Profile');
const { Department, Section, Intake } = require('./Academic');
const Student = require('./Student');
const Teacher = require('./Teacher');
const ClassRoutine = require('./ClassRoutine');
const Assignment = require('./Assignment');
const Schedule = require('./Schedule');
const Announcement = require('./Announcement');
const UpcomingExam = require('./UpcomingExam');
const ChatMessage = require('./ChatMessage');
const Room = require('./Room');
const Resource = require('./Resource');
const ClassPost = require('./ClassPost');
const ClassAssignment = require('./ClassAssignment');
const Submission = require('./Submission');

module.exports = {
  User,
  Profile,
  Department,
  Section,
  Intake,
  Student,
  Teacher,
  ClassRoutine,
  Assignment,
  Schedule,
  Announcement,
  UpcomingExam,
  ChatMessage,
  Room,
  Resource
  ,ClassPost
  ,ClassAssignment
  ,Submission
};