const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, markMessagesRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/read', markMessagesRead);

module.exports = router;
