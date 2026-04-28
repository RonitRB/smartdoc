const express = require('express');
const router = express.Router();
const { askQuestion, getChatHistory, clearChatHistory } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/:documentId', askQuestion);
router.get('/:documentId/history', getChatHistory);
router.delete('/:documentId/history', clearChatHistory);

module.exports = router;
