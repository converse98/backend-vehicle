const { body } = require('express-validator');

exports.validateAccessory = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('category')
    .optional()
    .isIn(['helmet', 'gloves', 'jacket', 'tires', 'other'])
    .withMessage('Invalid category'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('images')
    .optional()
    .isArray().withMessage('Images must be an array of URLs'),

  body('available')
    .optional()
    .isBoolean().withMessage('Available must be a boolean')
];
