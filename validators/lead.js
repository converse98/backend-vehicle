const { body } = require('express-validator');

exports.validateLead = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }).withMessage('Last name must be at most 100 characters'),

  body('firstName')
    .optional()
    .isLength({ max: 100 }).withMessage('First name must be at most 100 characters'),

  body('phone')
    .optional()
    .isLength({ min: 6 }).withMessage('Phone must be at least 6 digits'),

  body('message')
    .optional()
    .isLength({ max: 500 }).withMessage('Message must be at most 500 characters'),

  body('publicationId')
    .notEmpty().withMessage('Publication ID is required')
    .isMongoId().withMessage('Publication ID must be a valid Mongo ID')
];
