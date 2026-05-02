const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc  Create a project
// @route POST /api/projects
const createProject = async (req, res) => {
  try {
    if (req.user.role !== 'lead') {
      return res.status(403).json({ message: 'Only Team Leads can create projects' });
    }
    const { title, description, deadline, tags } = req.body;
    const project = await Project.create({
      title,
      description,
      deadline,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      admin: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all projects for current user (admin or member)
// @route GET /api/projects
const getProjects = async (req, res) => {
  try {
    // Return all projects so members don't see an empty page
    const projects = await Project.find({})
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    // Attach progress to each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (p) => {
        if (p.status === 'completed') {
          return { ...p.toObject(), progress: 100, taskCount: 0 };
        }
        const tasks = await Task.find({ project: p._id });
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { ...p.toObject(), progress, taskCount: total };
      })
    );

    res.json(projectsWithProgress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single project
// @route GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('files.uploadedBy', 'name');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Members can access all projects for awareness
    // But we still track if they are part of it
    const isMember =
      project.admin._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m._id.toString() === req.user._id.toString());

    const tasks = await Task.find({ project: project._id });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ ...project.toObject(), progress, taskCount: total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update project
// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isLead = req.user.role === 'lead';
    const isMember = project.members.includes(req.user._id) || project.admin.toString() === req.user._id.toString();

    if (!isLead || !isMember)
      return res.status(403).json({ message: 'Only a Team Lead member can update this project' });

    const { title, description, deadline, status, tags } = req.body;
    project.title = title || project.title;
    project.description = description ?? project.description;
    project.deadline = deadline || project.deadline;
    project.status = status || project.status;
    project.tags = tags ? tags.split(',').map((t) => t.trim()) : project.tags;

    if (status === 'completed') {
      await Task.updateMany({ project: project._id }, { status: 'completed' });
    }

    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete project
// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only admin can delete project' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Add member to project
// @route POST /api/projects/:id/members
const addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'lead' && project.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only Team Leads can add members' });

    const { userId } = req.body;
    if (project.members.includes(userId))
      return res.status(400).json({ message: 'User already a member' });

    project.members.push(userId);
    await project.save();
    const updated = await Project.findById(project._id)
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Remove member from project
// @route DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'lead' && project.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only Team Leads can remove members' });

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
