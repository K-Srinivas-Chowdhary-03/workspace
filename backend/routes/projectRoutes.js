const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').get(protect, getProject).put(protect, updateProject).delete(protect, deleteProject);
router.route('/:id/members').post(protect, addMember);
router.route('/:id/members/:userId').delete(protect, removeMember);

module.exports = router;
