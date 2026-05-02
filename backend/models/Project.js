const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Project title is required'], trim: true },
    description: { type: String, default: '' },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    deadline: { type: Date },
    files: [fileSchema],
    tags: [String],
  },
  { timestamps: true }
);

// Virtual: compute task progress (resolved in controller via Task model)
projectSchema.virtual('progressPercent').get(function () {
  return 0; // computed dynamically in controller
});

module.exports = mongoose.model('Project', projectSchema);
