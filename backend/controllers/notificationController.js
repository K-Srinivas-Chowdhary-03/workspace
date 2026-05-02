const Notification = require('../models/Notification');
const Task = require('../models/Task');

// @desc  Get all notifications for logged in user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar role')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
    
    // Automatically mark all as read when page is opened
    // await Notification.updateMany({ recipient: req.user._id, status: 'pending' }, { status: 'read' });
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get unread notifications count
// @route GET /api/notifications/unread
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, status: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Handle notification action (Accept/Reject)
// @route PUT /api/notifications/:id/action
const handleNotificationAction = async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' or 'rejected'
    console.log(`Handling notification action: ${action} for notification ${req.params.id}`);
    
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.status !== 'pending') {
      return res.status(400).json({ message: 'Action already taken on this notification' });
    }

    notification.status = action;
    await notification.save();

    const task = await Task.findById(notification.task);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    console.log(`Processing notification type: ${notification.type} for task: ${task.title}`);

    if (notification.type === 'task_assignment') {
      if (action === 'accepted') {
        task.status = 'in-progress';
        await task.save();
        console.log('Task assignment accepted. Moved to in-progress.');

        // Notify Lead that task was accepted
        await Notification.create({
          recipient: notification.sender,
          sender: req.user._id,
          type: 'task_approval',
          project: notification.project,
          task: notification.task,
          message: `${req.user.name} has accepted the task: ${task.title}`
        });
      } else {
        // Rejection -> back to backlog
        task.status = 'backlog';
        await task.save();
        console.log('Task assignment rejected. Moved back to backlog.');

        await Notification.create({
          recipient: notification.sender,
          sender: req.user._id,
          type: 'task_rejection',
          project: notification.project,
          task: notification.task,
          message: `${req.user.name} has rejected the task: ${task.title}`
        });
      }
    } else if (notification.type === 'task_completion') {
      if (action === 'accepted') {
        task.status = 'review';
        await task.save();
        console.log('Task completion accepted. Moved to review.');

        // Notify Member that work was approved
        await Notification.create({
          recipient: notification.sender,
          sender: req.user._id,
          type: 'task_approval',
          project: notification.project,
          task: notification.task,
          message: `Your work for "${task.title}" has been approved!`
        });
      } else {
        // Reject completion -> back to in-progress
        task.status = 'in-progress';
        await task.save();
        console.log('Task completion rejected. Moved back to in-progress.');

        await Notification.create({
          recipient: notification.sender,
          sender: req.user._id,
          type: 'task_feedback',
          project: notification.project,
          task: notification.task,
          message: `Work for "${task.title}" was rejected. Please review and resubmit.`
        });
      }
    }

    res.json({ message: `Action ${action} successful`, notification });
  } catch (err) {
    console.error('Error in handleNotificationAction:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, handleNotificationAction, getUnreadCount };
