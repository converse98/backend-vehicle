const jwt = require('jsonwebtoken');
const Dealer = require('../models/Dealer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // For dealer authentication
    if (decoded.dealerId) {
      const dealer = await Dealer.findById(decoded.dealerId);
      if (!dealer) {
        return res.status(401).json({ error: 'Invalid token.' });
      }
      req.dealer = dealer;
      req.dealerId = dealer._id;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const verifyDealer = (req, res, next) => {
  const dealerId = req.params.id;
  
  if (req.dealerId && req.dealerId.toString() !== dealerId) {
    return res.status(403).json({ 
      error: 'Access denied. You can only access your own resources.' 
    });
  }
  
  next();
};

module.exports = { auth, verifyDealer };