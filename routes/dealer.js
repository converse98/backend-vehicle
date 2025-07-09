const express = require('express');
const router = express.Router();
const { auth, verifyDealer } = require('../middleware/auth');
const cache = require('../utils/cache');
const {
  getDealers,
  getDealer,
  createDealer,
  updateDealer,
  deleteDealer
} = require('../controllers/dealerController');

const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');

const {
  getAccessories,
  getAccessory,
  createAccessory,
  updateAccessory,
  deleteAccessory
} = require('../controllers/accessoryController');

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  searchPosts
} = require('../controllers/postController');

const {
  getLeads,
  createLead
} = require('../controllers/leadController');

// Dealer routes
router.get('/', cache(300), getDealers);
router.get('/:id', cache(300), getDealer);
router.post('/', auth, createDealer);
router.put('/:id', auth, verifyDealer, updateDealer);
router.delete('/:id', auth, verifyDealer, deleteDealer);

// Vehicle routes
router.get('/:id/vehicles', cache(300), getVehicles);
router.get('/:id/vehicles/:vehicleId', cache(300), getVehicle);
router.post('/:id/vehicles', auth, verifyDealer, createVehicle);
router.put('/:id/vehicles/:vehicleId', auth, verifyDealer, updateVehicle);
router.delete('/:id/vehicles/:vehicleId', auth, verifyDealer, deleteVehicle);

// Accessory routes
router.get('/:id/accessories', cache(300), getAccessories);
router.get('/:id/accessories/:accessoryId', cache(300), getAccessory);
router.post('/:id/accessories', auth, verifyDealer, createAccessory);
router.put('/:id/accessories/:accessoryId', auth, verifyDealer, updateAccessory);
router.delete('/:id/accessories/:accessoryId', auth, verifyDealer, deleteAccessory);

// Post routes
router.get('/:id/posts', cache(300), getPosts);
router.get('/:id/posts/search', cache(300), searchPosts);
router.get('/:id/posts/:postId', cache(300), getPost);
router.post('/:id/posts', auth, verifyDealer, createPost);
router.put('/:id/posts/:postId', auth, verifyDealer, updatePost);
router.delete('/:id/posts/:postId', auth, verifyDealer, deletePost);

// Lead routes
router.get('/:id/leads', auth, verifyDealer, getLeads);
router.post('/:id/leads', createLead);

module.exports = router;