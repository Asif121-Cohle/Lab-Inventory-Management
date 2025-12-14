const Lab = require('../models/Lab');
const Material = require('../models/Material');

// @desc    Get all labs
// @route   GET /api/labs
// @access  Private
exports.getAllLabs = async (req, res) => {
  try {
    const labs = await Lab.find().sort({ name: 1 });
    res.json({ labs });
  } catch (error) {
    console.error('Get labs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get lab by ID
// @route   GET /api/labs/:id
// @access  Private
exports.getLabById = async (req, res) => {
  try {
    const labId = req.params.id;
    
    // Try by string ID first
    let lab = await Lab.findOne({ id: labId });
    
    // If not found, try by ObjectId
    if (!lab) {
      try {
        lab = await Lab.findById(labId);
      } catch (e) {
        // Not a valid ObjectId, continue
      }
    }
    
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.json({ lab });
  } catch (error) {
    console.error('Get lab error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get materials for a specific lab
// @route   GET /api/labs/:id/materials
// @access  Private
exports.getLabMaterials = async (req, res) => {
  try {
    const labId = req.params.id;
    
    // Find lab first - try by string ID first, then by ObjectId
    let lab = await Lab.findOne({ id: labId });
    
    // If not found by string ID, try by ObjectId
    if (!lab) {
      try {
        lab = await Lab.findById(labId);
      } catch (e) {
        // Not a valid ObjectId, continue
      }
    }
    
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Get materials for this lab by both lab._id and labId
    const materials = await Material.find({
      $or: [
        { lab: lab._id },
        { labId: lab.id }
      ]
    }).sort({ name: 1 });

    res.json({ materials });
  } catch (error) {
    console.error('Get lab materials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new lab
// @route   POST /api/labs
// @access  Private (Lab Assistant only)
exports.createLab = async (req, res) => {
  try {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json({ lab });
  } catch (error) {
    console.error('Create lab error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
