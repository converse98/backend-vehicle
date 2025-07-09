const express = require('express');
const router = express.Router({ mergeParams: true });
const Post = require('../models/Post');
const Vehicle = require('../models/Vehicle');
const Accessory = require('../models/Accessory');
const { auth } = require('../middleware/auth');
const cache = require('../utils/cache');
const { validatePost } = require('../validators/post');

// GET /api/dealer/:dealerId/posts - Obtener publicaciones de un concesionario
router.get('/', cache(900), async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { page = 1, limit = 10, type, status, featured } = req.query;
    
    const query = { dealer: dealerId };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    
    const posts = await Post.find(query)
      .populate('dealer', 'name email phone')
      .populate('item')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1 });
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: posts.length,
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dealer/:dealerId/posts/search - Buscar publicaciones
router.get('/search', cache(300), async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { text, page = 1, limit = 10 } = req.query;
    
    if (!text) {
      return res.status(400).json({ error: 'Search text is required' });
    }
    
    // Búsqueda en posts
    const postQuery = {
      dealer: dealerId,
      $or: [
        { title: { $regex: text, $options: 'i' } },
        { description: { $regex: text, $options: 'i' } }
      ]
    };
    
    // Búsqueda en vehículos
    const vehicleIds = await Vehicle.find({
      dealer: dealerId,
      name: { $regex: text, $options: 'i' }
    }).select('_id');
    
    // Búsqueda en accesorios
    const accessoryIds = await Accessory.find({
      dealer: dealerId,
      name: { $regex: text, $options: 'i' }
    }).select('_id');
    
    // Agregar IDs de items encontrados a la búsqueda
    if (vehicleIds.length > 0 || accessoryIds.length > 0) {
      postQuery.$or.push({
        itemId: { $in: [...vehicleIds.map(v => v._id), ...accessoryIds.map(a => a._id)] }
      });
    }
    
    const posts = await Post.find(postQuery)
      .populate('dealer', 'name email phone')
      .populate('item')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1 });
    
    const total = await Post.countDocuments(postQuery);
    
    res.json({
      posts,
      searchTerm: text,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: posts.length,
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dealer/:dealerId/posts/:id - Obtener una publicación específica
router.get('/:id', cache(900), async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      dealer: req.params.dealerId
    })
      .populate('dealer', 'name email phone address')
      .populate('item');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Incrementar contador de vistas
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dealer/:dealerId/posts - Crear una nueva publicación
router.post('/', auth, validatePost, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      dealer: req.params.dealerId
    };
    
    // Verificar que el item existe si es necesario
    if (postData.itemId) {
      const Model = postData.itemType === 'Vehicle' ? Vehicle : Accessory;
      const item = await Model.findOne({
        _id: postData.itemId,
        dealer: req.params.dealerId
      });
      
      if (!item) {
        return res.status(400).json({ error: 'Referenced item not found' });
      }
      
      // Auto-completar precio si no se proporciona
      if (!postData.price) {
        postData.price = item.price;
      }
    }
    
    const post = new Post(postData);
    await post.save();
    await post.populate(['dealer', 'item']);
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/dealer/:dealerId/posts/:id - Actualizar una publicación
router.put('/:id', auth, validatePost, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, dealer: req.params.dealerId },
      req.body,
      { new: true, runValidators: true }
    ).populate(['dealer', 'item']);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/dealer/:dealerId/posts/:id - Eliminar una publicación
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      dealer: req.params.dealerId
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;