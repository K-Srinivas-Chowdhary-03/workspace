const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Helper: verify project membership
const verifyMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember =
    project.admin.toString() === userId.toString() ||
    project.members.some((m) => m.toString() === userId.toString());
  return isMember ? project : null;
};

// @desc  Get all tasks for a project
// @route GET /api/projects/:projectId/tasks
const getTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create a task
// @route POST /api/projects/:projectId/tasks
const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'lead') {
      return res.status(403).json({ message: 'Only Team Leads can create tasks' });
    }
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    console.log('Creating task with data:', { title, assignedTo, status });
    
    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      assignedTo: assignedTo || null,
      status: status || 'backlog',
      priority: priority || 'medium',
      dueDate,
      acceptanceStatus: assignedTo ? 'pending_acceptance' : 'none'
    });

    if (assignedTo) {
      console.log(`Creating assignment notification for user: ${assignedTo}`);
      const notif = await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assignment',
        project: req.params.projectId,
        task: task._id,
        message: `${req.user.name} has assigned you a new task: ${task.title}`
      });
      console.log('Assignment notification created:', notif._id);
    }

    const populated = await task.populate('assignedTo', 'name email avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update task (including status for Kanban drag)
// @route PUT /api/projects/:projectId/tasks/:taskId
const updateTask = async (req, res) => {
  try {
    const project = await verifyMember(req.params.projectId, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied' });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    console.log('UPDATE TASK BODY:', req.body);
    const { title, description, assignedTo, status, priority, dueDate, requestReview } = req.body;
    console.log(`Updating task ${req.params.taskId}. requestReview:`, requestReview, 'User:', req.user._id);
    
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate ?? task.dueDate;

    // If member requests review (Work Completed) - MUST BE LAST to override status
    if (requestReview) {
      task.acceptanceStatus = 'pending_review';
      task.status = 'review'; // Force move to Under Review
      
      // Find all Leads in this project to notify
      const Project = require('../models/Project');
      const projectWithMembers = await Project.findById(project._id).populate('members', 'role');
      const leadsToNotify = projectWithMembers.members
        .filter(m => m.role === 'lead')
        .map(m => m._id);
      
      if (!leadsToNotify.some(id => id.toString() === project.admin.toString())) {
        leadsToNotify.push(project.admin);
      }

      for (const leadId of leadsToNotify) {
        await Notification.create({
          recipient: leadId,
          sender: req.user._id,
          type: 'task_feedback', // Non-actionable notification
          project: project._id,
          task: task._id,
          message: `${req.user.name} has submitted task "${task.title}" for review.`
        });
      }
    }

    const updated = await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('comments.user', 'name avatar');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete task
// @route DELETE /api/projects/:projectId/tasks/:taskId
const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'lead') {
      return res.status(403).json({ message: 'Only Team Leads can delete tasks' });
    }
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Add comment to task
// @route POST /api/projects/:projectId/tasks/:taskId/comments
const addComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('comments.user', 'name avatar');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete comment
// @route DELETE /api/projects/:projectId/tasks/:taskId/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to delete this comment' });

    comment.deleteOne();
    await task.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, addComment, deleteComment };
