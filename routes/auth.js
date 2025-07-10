const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Dealer = require('../models/Dealer');
const { asyncHandler } = require('../middleware/errorHandler');
const { auth } = require('../middleware/auth');
const { deleteCache } = require('../config/redis');

const router = express.Router();

// @desc    Register dealer
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { name, email, password, phone, address, description, website } = req.body;

  // Check if dealer already exists
  const existingDealer = await Dealer.findOne({ email });
  if (existingDealer) {
    return res.status(400).json({
      error: 'Registration failed',
      message: 'Dealer with this email already exists'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create dealer
  const dealer = new Dealer({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
    description,
    website
  });

  await dealer.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: dealer._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.status(201).json({
    message: 'Dealer registered successfully',
    token,
    dealer: {
      id: dealer._id,
      name: dealer.name,
      email: dealer.email,
      phone: dealer.phone,
      address: dealer.address,
      description: dealer.description,
      website: dealer.website
    }
  });
}));

// @desc    Login dealer
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Check if dealer exists
  const dealer = await Dealer.findOne({ email });
  if (!dealer) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid credentials'
    });
  }

  console.log(dealer);
  console.log(dealer.status)

  // Check if dealer is active
  if (!dealer.status == 'active'  ) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Account is inactive.'
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, dealer.password);
  if (!isMatch) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid credentials'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: dealer._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    dealer: {
      id: dealer._id,
      name: dealer.name,
      email: dealer.email,
      phone: dealer.phone,
      address: dealer.address,
      description: dealer.description,
      website: dealer.website
    }
  });
}));

// @desc    Get current dealer
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, asyncHandler(async (req, res) => {
  res.json({
    dealer: req.dealer
  });
}));

// @desc    Update dealer profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { name, phone, address, description, website, logo } = req.body;

  const dealer = await Dealer.findById(req.dealer._id);
  if (!dealer) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Dealer not found'
    });
  }

  // Update fields
  if (name) dealer.name = name;
  if (phone) dealer.phone = phone;
  if (address) dealer.address = address;
  if (description) dealer.description = description;
  if (website) dealer.website = website;
  if (logo) dealer.logo = logo;

  await dealer.save();

  // Clear cache
  await deleteCache(`user:${dealer._id}`);

  res.json({
    message: 'Profile updated successfully',
    dealer
  });
}));

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', auth, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  const dealer = await Dealer.findById(req.dealer._id);
  if (!dealer) {
    return res.status(404).json({
      error: 'Not found',
      message: 'Dealer not found'
    });
  }

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, dealer.password);
  if (!isMatch) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Current password is incorrect'
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  dealer.password = await bcrypt.hash(newPassword, salt);

  await dealer.save();

  // Clear cache
  await deleteCache(`user:${dealer._id}`);

  res.json({
    message: 'Password updated successfully'
  });
}));

module.exports = router;