const { body } = require('express-validator');
const WILAYAS = require('../../utils/wilayas');

const PHONE_REGEX = /^(\+213|0)(5|6|7)[0-9]{8}$/;
const PAYMENT_METHODS = ['cash_on_delivery', 'baridimob', 'ccp', 'card'];
const DELIVERY_TYPES = ['home', 'stopdesk'];

// isPaid/isDelivered/status are always server-computed (set by
// updateOrderStatus, payment webhooks, etc.) — never accepted at order
// creation, even though the controller never reads them from the body
// either; this gives a loud 422 instead of a silent no-op.
const blockServerComputedFields = ['isPaid', 'isDelivered', 'status'].map((field) =>
  body(field).not().exists().withMessage(`Le champ "${field}" ne peut pas être défini manuellement`)
);

const createOrderValidator = [
  ...blockServerComputedFields,
  body('orderItems').isArray({ min: 1 }).withMessage('La commande doit contenir au moins un article'),
  body('orderItems.*.productId')
    .notEmpty().withMessage('Identifiant de produit manquant')
    .isMongoId().withMessage('Identifiant de produit invalide'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantité invalide'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Le nom complet est obligatoire'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty().withMessage('Le téléphone est obligatoire')
    .matches(PHONE_REGEX).withMessage('Numéro de téléphone algérien invalide'),
  body('shippingAddress.street').trim().notEmpty().withMessage('La rue est obligatoire'),
  body('shippingAddress.city').trim().notEmpty().withMessage('La ville est obligatoire'),
  body('shippingAddress.wilaya')
    .trim()
    .notEmpty().withMessage('La wilaya est obligatoire')
    .isIn(WILAYAS).withMessage('Wilaya invalide'),
  body('paymentMethod').optional().isIn(PAYMENT_METHODS).withMessage('Méthode de paiement invalide'),
  body('deliveryType').optional().isIn(DELIVERY_TYPES).withMessage('Type de livraison invalide'),
];

module.exports = { createOrderValidator };
