const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../models/database');
require('dotenv').config();

const generateTokens = (userId, email) => {
  const payload = { userId, email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

const saveRefreshToken = (userId, refreshToken) => {
  const id = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, refreshToken, expiresAt.toISOString());
};

const register = async (name, email, password) => {
  // Check if user exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw { status: 409, message: 'Email already registered' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, name, email, password)
    VALUES (?, ?, ?, ?)
  `).run(id, name, email, hashedPassword);

  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id);
  const { accessToken, refreshToken } = generateTokens(id, email);
  saveRefreshToken(id, refreshToken);

  return { user, accessToken, refreshToken };
};

const login = async (email, password) => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.email);
  saveRefreshToken(user.id, refreshToken);

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

const refresh = (token) => {
  if (!token) {
    throw { status: 401, message: 'Refresh token is required' };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw { status: 403, message: 'Invalid or expired refresh token' };
  }

  // Check token exists in DB
  const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(token);
  if (!stored) {
    throw { status: 403, message: 'Refresh token not found or revoked' };
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.email);

  // Rotate refresh token
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
  saveRefreshToken(decoded.userId, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = (token) => {
  if (token) {
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
  }
};

module.exports = { register, login, refresh, logout };
