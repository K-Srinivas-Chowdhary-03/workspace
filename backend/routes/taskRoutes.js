const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:taskId').put(protect, updateTask).delete(protect, deleteTask);
router.route('/:taskId/comments').post(protect, addComment);
router.route('/:taskId/comments/:commentId').delete(protect, deleteComment);

module.exports = router;
