const express = require('express');
const router = express.Router({ mergeParams: true });
const Lead = require('../models/Lead');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');
const cache = require('../utils/cache');
const { validateLead } = require('../validators/lead');

// GET /api/dealer/:dealerId/leads - Obtener leads de un concesionario
router.get('/', auth, cache(600), async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { page = 1, limit = 10, status, inquiry, priority, dateFrom, dateTo } = req.query;
    
    const query = { dealer: dealerId };
    
    if (status) query.status = status;
    if (inquiry) query.inquiry = inquiry;
    if (priority) query.priority = priority;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const leads = await Lead.find(query)
      .populate('dealer', 'name email phone')
      .populate('post', 'title type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Lead.countDocuments(query);
    
    // Estadísticas básicas
    const stats = await Lead.aggregate([
      { $match: { dealer: dealerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      leads,
      stats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: leads.length,
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dealer/:dealerId/leads/:id - Obtener un lead específico
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      dealer: req.params.dealerId
    })
      .populate('dealer', 'name email phone address')
      .populate({
        path: 'post',
        populate: {
          path: 'item',
          model: function() {
            return this.itemType;
          }
        }
      });
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/dealer/:dealerId/leads - Crear un nuevo lead
router.post('/', validateLead, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      dealer: req.params.dealerId
    };
    
    // Verificar que el post existe y pertenece al dealer
    const post = await Post.findOne({
      _id: leadData.post,
      dealer: req.params.dealerId
    });
    
    if (!post) {
      return res.status(400).json({ error: 'Post not found or does not belong to this dealer' });
    }
    
    const lead = new Lead(leadData);
    await lead.save();
    await lead.populate(['dealer', 'post']);
    
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/dealer/:dealerId/leads/:id - Actualizar un lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, dealer: req.params.dealerId },
      req.body,
      { new: true, runValidators: true }
    ).populate(['dealer', 'post']);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/dealer/:dealerId/leads/:id/notes - Agregar nota a un lead
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { content, author } = req.body;
    
    if (!content || !author) {
      return res.status(400).json({ error: 'Content and author are required' });
    }
    
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, dealer: req.params.dealerId },
      {
        $push: {
          notes: {
            content,
            author,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate(['dealer', 'post']);
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/dealer/:dealerId/leads/analytics/summary - Resumen analítico
router.get('/analytics/summary', auth, cache(1800), async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { dateFrom, dateTo } = req.query;
    
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }
    
    const pipeline = [
      { $match: { dealer: dealerId, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          byStatus: {
            $push: {
              status: '$status',
              inquiry: '$inquiry',
              priority: '$priority'
            }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $unwind: '$byStatus'
      },
      {
        $group: {
          _id: {
            status: '$byStatus.status',
            inquiry: '$byStatus.inquiry',
            priority: '$byStatus.priority'
          },
          count: { $sum: 1 },
          totalLeads: { $first: '$totalLeads' }
        }
      }
    ];
    
    const analytics = await Lead.aggregate(pipeline);
    
    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;