// src/services/userService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { jwtSecret } = require('../config');

const SALT_ROUNDS = 10;

async function register({ email, password, name }) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.query(
    `INSERT INTO users (email, password_hash, name, role, subscription_tier, is_email_verified, is_active)
     VALUES ($1, $2, $3, 'user', 'free', false, true)
     RETURNING id, email, name, role`,
    [email, hash, name]
  );
  const user = result.rows[0];
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    jwtSecret,
    { expiresIn: '7d' }
  );
  return { user, token };
}

async function login({ email, password }) {
  const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = result.rows[0];
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    jwtSecret,
    { expiresIn: '7d' }
  );
  return { user, token };
}

async function getById(id) {
  const result = await db.query('SELECT id, email, name, role FROM users WHERE id=$1', [id]);
  return result.rows[0];
}

module.exports = {
  register,
  login,
  getById,
};
