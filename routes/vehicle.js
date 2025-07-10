const express = require('express');
const router = express.Router({ mergeParams: true });
const Vehicle = require('../models/Vehicle');
const { auth, verifyDealer } = require('../middleware/auth');
const cache = require('../utils/cache');
const { validateVehicle } = require('../validators/vehicle');

// GET /api/dealer/:dealerId/vehicles - Obtener vehículos de un concesionario
router.get('/', cache(1800), async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { page = 1, limit = 10, brand, model, year, minPrice, maxPrice, status, condition } = req.query;
    
    const query = { dealer: dealerId };
    
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (model) query.model = { $regex: model, $options: 'i' };
    if (year) query.year = parseInt(year);
    if (status) query.status = status;
    if (condition) query.condition = condition;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    const vehicles = await Vehicle.find(query)
      .populate('dealer', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Vehicle.countDocuments(query);
    
    res.json({
      vehicles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: vehicles.length,
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dealer/:dealerId/vehicles/:id - Obtener un vehículo específico
router.get('/:id', cache(1800), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      dealer: req.params.dealerId
    }).populate('dealer', 'name email phone address');
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dealer/:dealerId/vehicles - Crear un nuevo vehículo
router.post('/', auth, verifyDealer, validateVehicle, async (req, res) => {
  try {
    console.log(req.params)
    const vehicleData = {
      ...req.body,
      dealer: req.params.dealer
    };
    
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    await vehicle.populate('dealer', 'name email phone');
    
    res.status(201).json(vehicle);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'VIN already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/dealer/:dealerId/vehicles/:id - Actualizar un vehículo
router.put('/:id', auth, verifyDealer, validateVehicle, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, dealer: req.params.dealerId },
      req.body,
      { new: true, runValidators: true }
    ).populate('dealer', 'name email phone');
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/dealer/:dealerId/vehicles/:id - Eliminar un vehículo
router.delete('/:id', auth, verifyDealer, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      dealer: req.params.dealerId
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;