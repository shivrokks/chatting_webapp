const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// You'll need to create a messageController.js file with these functions
const { sendMessage, getMessages } = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/:chatId', protect, getMessages);

module.exports = router;