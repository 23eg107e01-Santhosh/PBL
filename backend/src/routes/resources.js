const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { uploadResource, listResources, deleteResource } = require('../controllers/resourceController');

router.post('/upload', authenticate, uploadFields, uploadResource);
router.get('/:roomId', authenticate, listResources);
router.delete('/:id', authenticate, deleteResource);

module.exports = router;
