const express = require('express');
const router = express.Router({ mergeParams: true });
const { uploadProjectFile, uploadTaskFile, deleteProjectFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Project file upload
router.post('/projects/:id/files', protect, upload.single('file'), uploadProjectFile);
router.delete('/projects/:id/files/:fileId', protect, deleteProjectFile);

// Task file upload
router.post('/projects/:projectId/tasks/:taskId/files', protect, upload.single('file'), uploadTaskFile);

module.exports = router;
