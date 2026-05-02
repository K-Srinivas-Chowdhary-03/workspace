const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['task_assignment', 'task_rejection', 'task_completion', 'task_approval', 'task_feedback'],
    required: true 
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'read', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
