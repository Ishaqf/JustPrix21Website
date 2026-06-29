const crypto = require('crypto');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../utils/email');
const { uploadImage, deleteImage, getPublicIdFromUrl } = require('../utils/cloudinary');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Un compte existe déjà avec cet email');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Ce compte est désactivé');
  }

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Utilisateur récupéré',
    data: req.user,
  });
});

// @desc    Update current logged-in user
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  // Changing the password requires proving you still know the current
  // one — `protect` loads req.user with .select('-password'), so it has
  // to be re-fetched with the hash included just for this check. Without
  // this, a leaked/stolen token alone would be enough to silently lock
  // the real owner out by changing their password.
  if (req.body.password !== undefined) {
    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error('Le mot de passe actuel est obligatoire pour le changer');
    }
    const userWithPassword = await User.findById(req.user._id).select('+password');
    if (!(await userWithPassword.matchPassword(req.body.currentPassword))) {
      res.status(401);
      throw new Error('Mot de passe actuel incorrect');
    }
    req.user.password = req.body.password;
  }

  // Profile.jsx submits multipart/form-data (so it can carry the avatar
  // file in the same request) — a nested object like address can't travel
  // as a plain form field, so the client JSON-stringifies it, same pattern
  // productController uses for `specs` on multipart product forms.
  if (req.body.address !== undefined) {
    if (typeof req.body.address === 'string') {
      try {
        req.user.address = JSON.parse(req.body.address);
      } catch {
        res.status(400);
        throw new Error('Le champ "address" doit être un JSON valide');
      }
    } else {
      req.user.address = req.body.address;
    }
  }

  const file = req.files?.[0];
  if (file) {
    const previousPublicId = getPublicIdFromUrl(req.user.avatar);
    const { url } = await uploadImage(file.buffer, 'justprix21/avatars');
    req.user.avatar = url;
    if (previousPublicId) {
      try {
        await deleteImage(previousPublicId);
      } catch (err) {
        console.error(`Échec suppression Cloudinary (${previousPublicId}):`, err.message);
      }
    }
  }

  const updatedUser = await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Profil mis à jour',
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      avatar: updatedUser.avatar,
    },
  });
});

// @desc    Request a password reset email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const respondGeneric = () =>
    res.status(200).json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    });

  const user = await User.findOne({ email });
  if (!user) {
    return respondGeneric();
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expireMinutes = Number(process.env.RESET_PASSWORD_EXPIRE_MINUTES) || 30;

  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpire = new Date(Date.now() + expireMinutes * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail(user, resetUrl, expireMinutes);
  } catch (err) {
    console.error('Échec envoi email réinitialisation:', err.message);
  }

  return respondGeneric();
});

// @desc    Reset password using the emailed token
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: mongoose.trusted({ $gt: new Date() }),
  });

  if (!user) {
    res.status(400);
    throw new Error('Lien de réinitialisation invalide ou expiré');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc    Sign in (or sign up) with a Google ID token
// @route   POST /api/users/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    res.status(401);
    throw new Error('Jeton Google invalide');
  }

  // email_verified guards against trusting an email claim Google itself
  // hasn't confirmed the account actually owns — skipping this check would
  // let an attacker "log in as" any email via an unverified Google account.
  if (!payload.email_verified) {
    res.status(401);
    throw new Error('Email Google non vérifié');
  }

  const { email, name, picture, sub } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: crypto.randomBytes(32).toString('hex'),
      googleId: sub,
      avatar: picture || '',
    });
  } else {
    if (!user.googleId) user.googleId = sub;
    if (!user.avatar && picture) user.avatar = picture;
    if (user.isModified()) await user.save();
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Ce compte est désactivé');
  }

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

module.exports = { register, login, getMe, updateMe, forgotPassword, resetPassword, googleAuth };
