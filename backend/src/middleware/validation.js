const { body } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'student', 'teacher'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const studentValidation = [
  body('personalId')
    .notEmpty()
    .withMessage('Personal ID is required'),
  body('name')
    .isLength({ min: 2, max: 350 })
    .withMessage('Name must be between 2 and 350 characters'),
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('Gender must be male or female'),
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  body('section')
    .notEmpty()
    .withMessage('Section is required'),
  body('shift')
    .isIn(['Day', 'Evening'])
    .withMessage('Shift must be Day or Evening'),
  body('contactNumber')
    .optional()
    .matches(/^\d{10,15}$/)
    .withMessage('Contact number must be 10-15 digits')
];

const teacherValidation = [
  body('personalId')
    .notEmpty()
    .withMessage('Personal ID is required'),
  body('name')
    .isLength({ min: 2, max: 350 })
    .withMessage('Name must be between 2 and 350 characters'),
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('Gender must be male or female')
];

const classRoutineValidation = [
  body('day')
    .isIn(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'])
    .withMessage('Invalid day'),
  body('time')
    .isIn([
      '08:00AMto09:15AM',
      '09:15AMto10:30AM',
      '10:30AMto11:45AM',
      '11:45AMto01:00PM',
      '01:30PMto02:45PM',
      '02:45PMto04:00PM',
      '04:00PMto05:15PM',
      '05:15PMto06:30PM'
    ])
    .withMessage('Invalid time slot'),
  body('courseCode')
    .isLength({ min: 1, max: 8 })
    .withMessage('Course code must be between 1 and 8 characters'),
  body('facultyShortName')
    .isLength({ min: 1, max: 5 })
    .withMessage('Faculty short name must be between 1 and 5 characters'),
  body('building')
    .isInt({ min: 1 })
    .withMessage('Building must be a positive integer'),
  body('room')
    .isInt({ min: 1 })
    .withMessage('Room must be a positive integer')
];

const assignmentValidation = [
  body('types')
    .optional()
    .isIn(['assignment', 'lab_report', 'presentation'])
    .withMessage('Invalid assignment type'),
  body('courseCode')
    .isLength({ min: 1, max: 8 })
    .withMessage('Course code must be between 1 and 8 characters'),
  body('courseTitle')
    .isLength({ min: 1, max: 100 })
    .withMessage('Course title must be between 1 and 100 characters'),
  body('assignmentTitle')
    .isLength({ min: 1, max: 150 })
    .withMessage('Assignment title must be between 1 and 150 characters'),
  body('detail')
    .notEmpty()
    .withMessage('Assignment detail is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

const announcementValidation = [
  body('announcement')
    .isLength({ min: 1, max: 500 })
    .withMessage('Announcement must be between 1 and 500 characters')
];

const examValidation = [
  body('examName')
    .isIn(['Class Test', 'Quiz Test', 'Mid Term', 'Final Test'])
    .withMessage('Invalid exam name'),
  body('courseName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Course name must be between 1 and 50 characters'),
  body('courseCode')
    .isLength({ min: 1, max: 7 })
    .withMessage('Course code must be between 1 and 7 characters'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('topic')
    .isLength({ min: 1, max: 150 })
    .withMessage('Topic must be between 1 and 150 characters'),
  body('detail')
    .notEmpty()
    .withMessage('Detail is required')
];

const scheduleValidation = [
  body('title')
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters'),
  body('courseCode')
    .isLength({ min: 1, max: 10 })
    .withMessage('Course code must be between 1 and 10 characters'),
  body('courseTitle')
    .isLength({ min: 1, max: 100 })
    .withMessage('Course title must be between 1 and 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('timeSlots')
    .isArray({ min: 1 })
    .withMessage('At least one time slot is required'),
  body('timeSlots.*.day')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  body('timeSlots.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('timeSlots.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('sections')
    .isArray({ min: 1 })
    .withMessage('At least one section is required')
];

module.exports = {
  registerValidation,
  loginValidation,
  studentValidation,
  teacherValidation,
  classRoutineValidation,
  assignmentValidation,
  announcementValidation,
  examValidation,
  scheduleValidation
};