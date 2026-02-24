const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMessages,
  getMyAssignments
} = require('../controller/chatController');

router.get('/assignments', authMiddleware, getMyAssignments);
router.get('/messages/:assignmentId', authMiddleware, getMessages);

module.exports = router;