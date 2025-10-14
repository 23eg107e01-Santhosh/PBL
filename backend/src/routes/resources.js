const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { uploadResource, listResources } = require('../controllers/resourceController');

router.post('/upload', authenticate, uploadFields, uploadResource);
router.get('/:roomId', authenticate, listResources);

module.exports = router;
