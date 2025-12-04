// src/routes/conversation.js
const express = require('express');
const router = express.Router();
const convController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // protect all below

router.post('/', convController.create);
router.get('/', convController.list);
router.get('/:id', convController.get);
router.get('/:id/messages', convController.getMessages);
router.post('/:id/message', convController.addMessage);

module.exports = router;
