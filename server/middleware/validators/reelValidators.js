const { body } = require('express-validator');

const INSTAGRAM_URL_REGEX = /^https:\/\/(www\.)?instagram\.com\/(reel|p)\/[A-Za-z0-9_-]+\/?/;
const BADGES = ['Promo', 'Pack', 'Affaire du jour', 'Nouveauté'];

const createReelValidator = [
  body('instagramUrl')
    .trim()
    .notEmpty().withMessage("L'URL Instagram est obligatoire")
    .matches(INSTAGRAM_URL_REGEX).withMessage('URL Instagram invalide'),
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 150 }).withMessage('Le titre ne doit pas dépasser 150 caractères'),
  body('badge').optional().isIn(BADGES).withMessage('Badge invalide'),
  body('products')
    .isArray({ min: 1, max: 10 }).withMessage('Une affaire doit contenir entre 1 et 10 produits'),
  body('products.*').isMongoId().withMessage('Identifiant de produit invalide'),
  body('order').optional().isInt().withMessage("L'ordre doit être un nombre entier"),
];

// Same checks as create, just optional() since a PUT may only touch some
// fields — kept consistent with how product validators handle create/update.
const updateReelValidator = [
  body('instagramUrl').optional().trim().matches(INSTAGRAM_URL_REGEX).withMessage('URL Instagram invalide'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Le titre ne peut pas être vide')
    .isLength({ max: 150 }).withMessage('Le titre ne doit pas dépasser 150 caractères'),
  body('badge').optional().isIn(BADGES).withMessage('Badge invalide'),
  body('products')
    .optional()
    .isArray({ min: 1, max: 10 }).withMessage('Une affaire doit contenir entre 1 et 10 produits'),
  body('products.*').optional().isMongoId().withMessage('Identifiant de produit invalide'),
  body('order').optional().isInt().withMessage("L'ordre doit être un nombre entier"),
  body('isActive').optional().isBoolean().withMessage('isActive doit être un booléen'),
];

module.exports = { createReelValidator, updateReelValidator };
