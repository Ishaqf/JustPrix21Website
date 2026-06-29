const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ max: 60 }).withMessage('Le nom ne doit pas dépasser 60 caractères'),
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage('Email invalide'),
  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est obligatoire'),
];

const updateMeValidator = [
  body('role').not().exists().withMessage("Le champ \"role\" ne peut pas être modifié"),
  body('googleId').not().exists().withMessage("Le champ \"googleId\" ne peut pas être modifié"),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom ne peut pas être vide')
    .isLength({ max: 60 }).withMessage('Le nom ne doit pas dépasser 60 caractères'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est obligatoire")
    .isEmail().withMessage('Email invalide'),
];

const resetPasswordValidator = [
  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
];

const googleAuthValidator = [
  body('credential').notEmpty().withMessage('Le jeton Google est manquant'),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateMeValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  googleAuthValidator,
};
