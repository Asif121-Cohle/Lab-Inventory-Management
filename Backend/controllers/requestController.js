const Request = require('../models/Request');
const Material = require('../models/Material');
const UsageLog = require('../models/UsageLog');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// @desc    AI-powered material suggestion based on project description
// @route   POST /api/requests/ai-suggest
// @access  Private (Student only)
exports.aiSuggestMaterials = async (req, res) => {
  try {
    const { projectDescription, labId } = req.body;

    if (!projectDescription || projectDescription.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Please provide a detailed project description (at least 10 characters)' 
      });
    }

    // Get all available materials
    let materialsQuery = { quantity: { $gt: 0 } };
    
    if (labId) {
      // Find lab by string id to get ObjectId
      const Lab = require('../models/Lab');
      const lab = await Lab.findOne({ id: labId });
      if (lab) {
        materialsQuery.lab = lab._id;
      }
    }
    
    const availableMaterials = await Material.find(materialsQuery)
      .populate('lab', 'name id')
      .select('name description category tags quantity lab');

    if (availableMaterials.length === 0) {
      return res.status(404).json({ message: 'No materials available' });
    }

    // Check if Gemini API is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
      // Fallback: Simple keyword matching
      const keywords = projectDescription.toLowerCase().split(/\s+/);
      const suggestions = availableMaterials
        .filter(m => {
          const searchText = `${m.name} ${m.description} ${m.category} ${m.tags.join(' ')}`.toLowerCase();
          return keywords.some(keyword => searchText.includes(keyword));
        })
        .slice(0, 5)
        .map(m => ({
          materialId: m._id,
          name: m.name,
          description: m.description,
          quantity: 1,
          available: m.quantity,
          lab: m.lab,
          reason: 'Keyword match'
        }));

      return res.json({ suggestions, aiPowered: false });
    }

    // Use Gemini AI for smart suggestions
    const materialsList = availableMaterials.map(m => 
      `${m.name} (${m.category}) - ${m.description || 'No description'} [${m.quantity} available]`
    ).join('\n');

    const prompt = `You are a lab inventory assistant helping students find materials for their projects.

STUDENT PROJECT: ${projectDescription}

AVAILABLE MATERIALS:
${materialsList}

TASK: Analyze the project and suggest 3-7 materials from the list above that the student will need.

For each suggestion, provide:
1. Exact material name (must match available materials)
2. Recommended quantity (reasonable for the project)
3. Brief reason why it's needed

Respond ONLY with valid JSON, no markdown:
{
  "suggestions": [
    {
      "materialName": "exact name from list",
      "quantity": number,
      "reason": "brief explanation"
    }
  ]
}`;

    console.log('🤖 AI Material Suggestion request for:', projectDescription.substring(0, 50) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('📝 AI Response received');

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Match AI suggestions with actual materials in database
    const matchedSuggestions = aiResponse.suggestions
      .map(suggestion => {
        const material = availableMaterials.find(m => 
          m.name.toLowerCase().includes(suggestion.materialName.toLowerCase()) ||
          suggestion.materialName.toLowerCase().includes(m.name.toLowerCase())
        );

        if (!material) return null;

        // Ensure quantity doesn't exceed available
        const recommendedQty = Math.min(
          suggestion.quantity, 
          material.quantity,
          10 // Cap at 10 for safety
        );

        return {
          materialId: material._id,
          name: material.name,
          description: material.description,
          category: material.category,
          tags: material.tags,
          quantity: recommendedQty,
          available: material.quantity,
          lab: material.lab,
          reason: suggestion.reason
        };
      })
      .filter(s => s !== null);

    if (matchedSuggestions.length === 0) {
      return res.status(404).json({ 
        message: 'AI could not find matching materials. Try describing your project differently.' 
      });
    }

    console.log(`✅ Suggested ${matchedSuggestions.length} materials`);

    res.json({ 
      suggestions: matchedSuggestions,
      aiPowered: true,
      totalSuggestions: matchedSuggestions.length
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate suggestions',
      aiPowered: false
    });
  }
};
