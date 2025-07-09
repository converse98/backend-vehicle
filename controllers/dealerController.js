const Dealer = require('../models/Dealer');

exports.getDealer = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    res.json(dealer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getDealers = async (req, res) => {
  try {
    const dealers = await Dealer.find(); // Puedes agregar filtros si es necesario
    res.json(dealers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDealerById = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    res.json(dealer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDealer = async (req, res) => {
  try {
    const dealer = new Dealer(req.body);
    await dealer.save();
    res.status(201).json(dealer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateDealer = async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    res.json(dealer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDealer = async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndDelete(req.params.id);
    if (!dealer) return res.status(404).json({ message: 'Dealer not found' });
    res.json({ message: 'Dealer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
