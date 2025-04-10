const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getOnlineUsers, searchUsers, sendRequest, acceptRequest } = require('../controllers/userController');

router.get('/online', protect, getOnlineUsers);
router.get('/search', protect, searchUsers);
router.post('/request/:id', protect, sendRequest);
router.post('/accept/:id', protect, acceptRequest);

module.exports = router;
