const express = require('express');
const router = express.Router({ mergeParams: true });
const Accessory = require('../models/Accessory');
const { auth } = require('../middleware/auth');
const cache = require('../utils/cache');
const { validateAccessory } = require('../validators/accessory');

// GET /api/dealer/:dealerId/accessories - Obtener accesorios de un concesionario
router.get('/', cache(1800), async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { page = 1, limit = 10, category, brand, minPrice, maxPrice, status } = req.query;
    
    const query = { dealer: dealerId };
    
    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (status) query.status = status;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    const accessories = await Accessory.find(query)
      .populate('dealer', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Accessory.countDocuments(query);
    
    res.json({
      accessories,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: accessories.length,
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dealer/:dealerId/accessories/:id - Obtener un accesorio específico
router.get('/:id', cache(1800), async (req, res) => {
  try {
    const accessory = await Accessory.findOne({
      _id: req.params.id,
      dealer: req.params.dealerId
    }).populate('dealer', 'name email phone address');
    
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    
    res.json(accessory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dealer/:dealerId/accessories - Crear un nuevo accesorio
router.post('/', auth, validateAccessory, async (req, res) => {
  try {
    const accessoryData = {
      ...req.body,
      dealer: req.params.dealerId
    };
    
    const accessory = new Accessory(accessoryData);
    await accessory.save();
    await accessory.populate('dealer', 'name email phone');
    
    res.status(201).json(accessory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/dealer/:dealerId/accessories/:id - Actualizar un accesorio
router.put('/:id', auth, validateAccessory, async (req, res) => {
  try {
    const accessory = await Accessory.findOneAndUpdate(
      { _id: req.params.id, dealer: req.params.dealerId },
      req.body,
      { new: true, runValidators: true }
    ).populate('dealer', 'name email phone');
    
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    
    res.json(accessory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/dealer/:dealerId/accessories/:id - Eliminar un accesorio
router.delete('/:id', auth, async (req, res) => {
  try {
    const accessory = await Accessory.findOneAndDelete({
      _id: req.params.id,
      dealer: req.params.dealerId
    });
    
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    
    res.json({ message: 'Accessory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;