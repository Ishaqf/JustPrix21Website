const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  res.status(422).json({ success: false, errors });
};

module.exports = validateRequest;
