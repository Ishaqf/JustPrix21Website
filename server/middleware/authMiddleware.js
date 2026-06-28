const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    res.status(401);
    throw new Error('Non autorisé, token manquant');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Non autorisé, token invalide');
  }

  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('Non autorisé, utilisateur introuvable');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Ce compte est désactivé');
  }

  req.user = user;
  next();
});

// Same token check as `protect`, but never rejects — used on public routes
// that change behavior when an admin is logged in (e.g. viewing an
// inactive product). A missing or invalid token just means req.user
// stays unset, not a 401.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // invalid/expired token on an optional-auth route — proceed unauthenticated
  }

  next();
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Accès réservé aux administrateurs');
};

module.exports = { protect, adminOnly, optionalAuth };
