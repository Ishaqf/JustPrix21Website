const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Non autorisé, token manquant');
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    res.status(401);
    throw new Error('Non autorisé, token manquant');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
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

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Accès réservé aux administrateurs');
};

module.exports = { protect, adminOnly };
