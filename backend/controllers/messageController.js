const Message = require('../models/Message');
const Notification = require('../models/Notification');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
    .populate('sender', 'name avatar')
    .populate('recipient', 'name avatar')
    .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      content
    });

    const populated = await message.populate('sender recipient', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markMessagesRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    await Message.updateMany(
      { sender: senderId, recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMessages, sendMessage, markMessagesRead };
