const Accessory = require('../models/Accessory');

exports.getAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find({ dealerId: req.params.id });
    res.json(accessories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findOne({ _id: req.params.id, dealerId: req.params.dealerId });
    if (!accessory) return res.status(404).json({ message: 'Accessory not found' });
    res.json(accessory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAccessory = async (req, res) => {
  try {
    const accessory = new Accessory({ ...req.body, dealerId: req.params.dealerId });
    await accessory.save();
    res.status(201).json(accessory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.params.dealerId },
      req.body,
      { new: true }
    );
    if (!accessory) return res.status(404).json({ message: 'Accessory not found' });
    res.json(accessory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findOneAndDelete({ _id: req.params.id, dealerId: req.params.dealerId });
    if (!accessory) return res.status(404).json({ message: 'Accessory not found' });
    res.json({ message: 'Accessory deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
