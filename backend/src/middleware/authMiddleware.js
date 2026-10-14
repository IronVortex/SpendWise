/**
 * Authentication Middleware
 * Validates JWT bearer token on protected API endpoints.
 */

const usersStore = require('../data/usersStore');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = usersStore.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.'
    });
  }

  const user = usersStore.findById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account no longer exists.'
    });
  }

  const { passwordHash: _, ...safeUser } = user;
  req.user = safeUser;
  next();
};
