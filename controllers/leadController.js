const Lead = require('../models/Lead');

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ dealerId: req.params.dealerId });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { email, lastName, publicationId } = req.body;

    if (!email || !lastName || !publicationId) {
      return res.status(400).json({ message: 'Missing required lead data' });
    }

    const lead = new Lead({
      email,
      lastName,
      publicationId,
      dealerId: req.params.dealerId,
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
