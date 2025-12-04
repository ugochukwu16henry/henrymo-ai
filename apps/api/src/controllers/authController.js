// src/controllers/authController.js
const userService = require('../services/userService');

async function register(req, res) {
  const { email, password, name } = req.body;
  try {
    const { user, token } = await userService.register({ email, password, name });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const { user, token } = await userService.login({ email, password });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message });
  }
}

async function me(req, res) {
  try {
    const user = await userService.getById(req.user.userId);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load user' });
  }
}

module.exports = {
  register,
  login,
  me,
};
