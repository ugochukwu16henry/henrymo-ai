// src/services/conversationService.js
const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

async function createConversation({ userId, title = 'New Conversation' }) {
  const result = await db.query(
    `INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *`,
    [userId, title]
  );
  return result.rows[0];
}

async function listByUser(userId) {
  const result = await db.query(
    `SELECT * FROM conversations WHERE user_id=$1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getConversation(conversationId, userId) {
  const result = await db.query(
    `SELECT * FROM conversations WHERE id=$1 AND user_id=$2`,
    [conversationId, userId]
  );
  return result.rows[0];
}

async function addMessage({ conversationId, role, content }) {
  const result = await db.query(
    `INSERT INTO messages (conversation_id, role, content)
     VALUES ($1, $2, $3) RETURNING *`,
    [conversationId, role, content]
  );
  return result.rows[0];
}

async function getMessages(conversationId) {
  const result = await db.query(
    `SELECT * FROM messages WHERE conversation_id=$1 ORDER BY created_at`,
    [conversationId]
  );
  return result.rows;
}

module.exports = {
  createConversation,
  listByUser,
  getConversation,
  addMessage,
  getMessages,
};
