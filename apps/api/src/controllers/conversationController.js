// src/controllers/conversationController.js
const convService = require('../services/conversationService');
const aiService = require('../services/aiService');

async function create(req, res) {
  const { title } = req.body;
  try {
    const conv = await convService.createConversation({
      userId: req.user.userId,
      title,
    });
    res.status(201).json(conv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
}

async function list(req, res) {
  try {
    const list = await convService.listByUser(req.user.userId);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
}

async function get(req, res) {
  const { id } = req.params;
  try {
    const conv = await convService.getConversation(id, req.user.userId);
    if (!conv) return res.status(404).json({ error: 'Not found' });
    res.json(conv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
}

async function addMessage(req, res) {
  const { id } = req.params; // conversation id
  const { content } = req.body;
  try {
    // 1️⃣ store user message
    await convService.addMessage({
      conversationId: id,
      role: 'user',
      content,
    });

    // 2️⃣ generate AI response (stub)
    const aiReply = await aiService.generateResponse({ prompt: content });

    // 3️⃣ store AI message
    await convService.addMessage({
      conversationId: id,
      role: 'assistant',
      content: aiReply,
    });

    // 4️⃣ return the AI reply
    res.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

async function getMessages(req, res) {
  const { id } = req.params;
  try {
    const msgs = await convService.getMessages(id);
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

module.exports = {
  create,
  list,
  get,
  addMessage,
  getMessages,
};
