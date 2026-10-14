/**
 * Authentication Controller
 * Handles user registration, login, profile retrieval, password recovery, and profile update.
 */

const usersStore = require('../data/usersStore');

// Simple regex for email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required (at least 2 characters).'
      });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const user = await usersStore.createUser({ name, email, password });
    const token = usersStore.generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Registration failed'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = usersStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await usersStore.verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = usersStore.generateToken(safeUser);

    res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Login failed'
    });
  }
};

exports.getMe = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

exports.forgotPassword = (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const user = usersStore.findByEmail(email);
    if (!user) {
      // Don't leak user enumeration in production, but provide helpful feedback
      return res.json({
        success: true,
        message: 'If an account exists with this email address, password recovery instructions have been prepared.'
      });
    }

    const resetToken = usersStore.createResetToken(user.email);

    res.json({
      success: true,
      message: 'Password recovery token generated.',
      // Explicit development mode notice
      note: 'In this local environment, email delivery services (SMTP) are not configured. Use the dev reset token below to reset your password.',
      devResetToken: resetToken,
      expiresIn: '1 hour'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Valid token and new password (min 8 characters) are required.'
      });
    }

    await usersStore.resetPasswordWithToken(token, newPassword);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await usersStore.updateProfile(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
