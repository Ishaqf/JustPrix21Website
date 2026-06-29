const { body } = require('express-validator');

const CATEGORIES = ['phones', 'accessories', 'tvs', 'gaming', 'laptops', 'electronics'];
const CONDITIONS = ['new', 'used', 'refurbished'];

// rating/numReviews/slug are always server-computed — block them explicitly
// so a client attempt gets a loud 422 instead of being silently dropped by
// the controller's WRITABLE_FIELDS whitelist.
const blockServerComputedFields = ['rating', 'numReviews', 'slug'].map((field) =>
  body(field).not().exists().withMessage(`Le champ "${field}" ne peut pas être défini manuellement`)
);

const createProductValidator = [
  ...blockServerComputedFields,
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ max: 200 }).withMessage('Le nom ne doit pas dépasser 200 caractères'),
  body('description').trim().notEmpty().withMessage('La description est obligatoire'),
  body('category')
    .trim()
    .notEmpty().withMessage('La catégorie est obligatoire')
    .isIn(CATEGORIES).withMessage('Catégorie invalide'),
  body('brand').trim().notEmpty().withMessage('La marque est obligatoire'),
  body('price')
    .notEmpty().withMessage('Le prix est obligatoire')
    .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('salePrice')
    .optional({ values: 'null' })
    .isFloat({ min: 0 }).withMessage('Le prix promo doit être un nombre positif'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif'),
  body('condition').optional().isIn(CONDITIONS).withMessage('Condition invalide'),
  body('warrantyMonths')
    .optional()
    .isInt({ min: 0 }).withMessage('La garantie doit être un nombre entier positif (en mois)'),
];

const updateProductValidator = [
  ...blockServerComputedFields,
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom ne peut pas être vide')
    .isLength({ max: 200 }).withMessage('Le nom ne doit pas dépasser 200 caractères'),
  body('category').optional().trim().isIn(CATEGORIES).withMessage('Catégorie invalide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('salePrice')
    .optional({ values: 'null' })
    .isFloat({ min: 0 }).withMessage('Le prix promo doit être un nombre positif'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif'),
  body('condition').optional().isIn(CONDITIONS).withMessage('Condition invalide'),
  body('warrantyMonths')
    .optional()
    .isInt({ min: 0 }).withMessage('La garantie doit être un nombre entier positif (en mois)'),
];

module.exports = { createProductValidator, updateProductValidator };
