const { body } = require('express-validator');

exports.validatePost = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 150 }).withMessage('Title must be at most 150 characters'),

  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('type')
    .notEmpty().withMessage('Post type is required')
    .isIn(['vehicle', 'accessory']).withMessage('Post type must be vehicle or accessory'),

  body('referenceId')
    .notEmpty().withMessage('Reference ID is required') // e.g., vehicleId o accessoryId
    .isMongoId().withMessage('Reference ID must be a valid Mongo ID'),

  body('images')
    .optional()
    .isArray().withMessage('Images must be an array'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('published')
    .optional()
    .isBoolean().withMessage('Published must be a boolean')
];
