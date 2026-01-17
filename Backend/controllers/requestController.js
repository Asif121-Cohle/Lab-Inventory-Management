const Request = require('../models/Request');
const Material = require('../models/Material');
const UsageLog = require('../models/UsageLog');

// @desc    Create new request
// @route   POST /api/requests
// @access  Private (Student only)
exports.createRequest = async (req, res) => {
  try {
    const { labId, materialId, quantity, purpose } = req.body;

    // Check if material exists and has enough quantity
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.quantity < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${material.quantity} units available` 
      });
    }

    const request = new Request({
      student: req.user._id,
      material: materialId,
      lab: material.lab,
      quantity,
      purpose
    });

    await request.save();

    // Populate for response
    await request.populate([
      { path: 'student', select: 'username email' },
      { path: 'material', select: 'name description' },
      { path: 'lab', select: 'name' }
    ]);

    res.status(201).json({ request });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get student's own requests
// @route   GET /api/requests/my-requests
// @access  Private (Student only)
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ student: req.user._id })
      .populate('material', 'name description')
      .populate('lab', 'name')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all pending requests
// @route   GET /api/requests/pending
// @access  Private (Lab Assistant only)
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .populate('student', 'username email')
      .populate('material', 'name description quantity')
      .populate('lab', 'name')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve request
// @route   PUT /api/requests/:id/approve
// @access  Private (Lab Assistant only)
exports.approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('material')
      .populate('student', 'username');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Check if material still has enough quantity
    if (request.material.quantity < request.quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Only ${request.material.quantity} units available` 
      });
    }

    // Update material quantity
    request.material.quantity -= request.quantity;
    await request.material.save();

    // Update request status
    request.status = 'approved';
    request.approvedBy = req.user._id;
    request.approvedAt = Date.now();
    await request.save();

    // Log usage
    await UsageLog.create({
      material: request.material._id,
      quantity: request.quantity,
      action: 'request_fulfilled',
      performedBy: req.user._id
    });

    await request.populate([
      { path: 'material', select: 'name' },
      { path: 'lab', select: 'name' }
    ]);

    res.json({ 
      message: 'Request approved successfully',
      request 
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Reject request
// @route   PUT /api/requests/:id/reject
// @access  Private (Lab Assistant only)
exports.rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.rejectionReason = reason || 'No reason provided';
    request.approvedBy = req.user._id;
    request.approvedAt = Date.now();
    await request.save();

    await request.populate([
      { path: 'student', select: 'username' },
      { path: 'material', select: 'name' },
      { path: 'lab', select: 'name' }
    ]);

    res.json({ 
      message: 'Request rejected',
      request 
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
