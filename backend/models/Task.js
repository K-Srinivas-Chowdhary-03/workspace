const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Task title is required'], trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['backlog', 'in-progress', 'review', 'completed'],
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    acceptanceStatus: { 
      type: String, 
      enum: ['none', 'pending_acceptance', 'accepted', 'rejected', 'pending_review'], 
      default: 'none' 
    },
    dueDate: { type: Date },
    comments: [commentSchema],
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
