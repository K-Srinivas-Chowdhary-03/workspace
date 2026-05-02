const Project = require('../models/Project');
const Task = require('../models/Task');
const path = require('path');

// @desc  Upload file to project
// @route POST /api/projects/:id/files
const uploadProjectFile = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Allow all authenticated users to upload files for collaboration
    // as per the new requirement where members see all projects.

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    project.files.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    });
    await project.save();

    res.status(201).json({
      message: 'File uploaded',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Upload file to task
// @route POST /api/projects/:projectId/tasks/:taskId/files
const uploadTaskFile = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    task.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
    });
    await task.save();
    res.status(201).json({ message: 'File uploaded', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete file from project
// @route DELETE /api/projects/:id/files/:fileId
const deleteProjectFile = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'lead' && project.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only Team Leads or the Project Admin can delete files' });

    project.files = project.files.filter(
      (f) => f._id.toString() !== req.params.fileId
    );
    await project.save();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadProjectFile, uploadTaskFile, deleteProjectFile };
