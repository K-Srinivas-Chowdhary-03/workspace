const express = require('express');
const router = express.Router();
const { getNotifications, handleNotificationAction, getUnreadCount } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.put('/:id/action', handleNotificationAction);

module.exports = router;
