/**
 * User Store & Authentication Service
 * Manages user accounts with bcrypt password hashing and persistent JSON storage.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class UsersStore {
  constructor() {
    this.usersFilePath = path.resolve(__dirname, 'users.json');
    this.resetTokens = new Map(); // token -> { email, expiresAt }
    this.init();
  }

  init() {
    if (!fs.existsSync(this.usersFilePath)) {
      // Pre-seed demo user with bcrypt hash for 'SpendSense@123'
      const salt = bcrypt.genSaltSync(10);
      const demoHashedPassword = bcrypt.hashSync('SpendSense@123', salt);

      const defaultUsers = [
        {
          id: 'user_demo_001',
          name: 'Alex Taylor',
          email: 'demo@spendsense.com',
          passwordHash: demoHashedPassword,
          role: 'Lead Analyst',
          createdAt: new Date().toISOString()
        }
      ];

      fs.writeFileSync(this.usersFilePath, JSON.stringify(defaultUsers, null, 2), 'utf8');
    }
  }

  getUsers() {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const raw = fs.readFileSync(this.usersFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading users file:', err.message);
    }
    return [];
  }

  saveUsers(users) {
    try {
      fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Error saving users file:', err.message);
      return false;
    }
  }

  findByEmail(email) {
    if (!email) return null;
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  findById(id) {
    if (!id) return null;
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async createUser({ name, email, password }) {
    const existing = this.findByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'Member',
      createdAt: new Date().toISOString()
    };

    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    const { passwordHash: _, ...userWithoutPass } = newUser;
    return userWithoutPass;
  }

  async verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch {
      return null;
    }
  }

  createResetToken(email) {
    const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + 3600 * 1000; // 1 hour validity
    this.resetTokens.set(token, { email: email.toLowerCase().trim(), expiresAt });
    return token;
  }

  verifyResetToken(token) {
    const record = this.resetTokens.get(token);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.resetTokens.delete(token);
      return null;
    }
    return record.email;
  }

  async resetPasswordWithToken(token, newPassword) {
    const email = this.verifyResetToken(token);
    if (!email) {
      throw new Error('Invalid or expired password reset token');
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    users[userIndex].passwordHash = await bcrypt.hash(newPassword, salt);
    this.saveUsers(users);
    this.resetTokens.delete(token);

    return true;
  }

  async updateProfile(userId, { name, newPassword, currentPassword }) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        throw new Error('Current password is required to change password');
      }
      const match = await this.verifyPassword(currentPassword, user.passwordHash);
      if (!match) {
        throw new Error('Current password is incorrect');
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    this.saveUsers(users);
    const { passwordHash: _, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new UsersStore();
