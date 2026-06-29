const { body } = require('express-validator');

const addReviewValidator = [
  body('user').not().exists().withMessage("Le champ \"user\" ne peut pas être défini manuellement"),
  body('product').not().exists().withMessage("Le champ \"product\" ne peut pas être défini manuellement"),
  body('rating')
    .notEmpty().withMessage('La note est obligatoire')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être comprise entre 1 et 5'),
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 100 }).withMessage('Le titre ne doit pas dépasser 100 caractères'),
  body('body')
    .trim()
    .notEmpty().withMessage('Le commentaire est obligatoire')
    .isLength({ max: 1000 }).withMessage('Le commentaire ne doit pas dépasser 1000 caractères'),
];

module.exports = { addReviewValidator };
