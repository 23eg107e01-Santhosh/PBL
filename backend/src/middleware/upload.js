const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'resourceFile') {
      uploadPath += 'resources/';
    } else if (file.fieldname === 'attachmentFile') {
      uploadPath += 'attachments/';
    } else if (file.fieldname === 'submissionFile') {
      uploadPath += 'submissions/';
    } else if (file.fieldname === 'announcementFile' || file.fieldname === 'announcementImage') {
      uploadPath += 'announcements/';
    } else {
      uploadPath += 'others/';
    }

    // Ensure directory exists
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
    } catch (e) {
      console.error('Failed to ensure upload path:', uploadPath, e);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types (images + common docs, incl. ppt/pptx)
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|ppt|pptx/;

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.match(/^(image|application)\/(jpeg|jpg|png|gif|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|plain|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resourceFile', maxCount: 1 },
  { name: 'attachmentFile', maxCount: 5 },
  { name: 'submissionFile', maxCount: 1 },
  { name: 'announcementImage', maxCount: 1 },
  { name: 'announcementFile', maxCount: 1 }
]);

module.exports = {
  upload,
  uploadFields
};

// Dedicated chat upload middleware with 20MB limit
const chatUpload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB for chat uploads
  },
  fileFilter: fileFilter
});

module.exports.uploadChatSingle = chatUpload.single('attachmentFile');