const { body } = require('express-validator');

exports.validateVehicle = [
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Year must be valid'),
  body('type').isIn(['motorcycle', 'scooter', 'atv', 'electric']).withMessage('Invalid vehicle type'),
  body('engineCapacity').isNumeric().withMessage('Engine capacity must be a number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];
