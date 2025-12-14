const Material = require('../models/Material');
const Lab = require('../models/Lab');
const UsageLog = require('../models/UsageLog');
const axios = require('axios');

// AI Categorization using Google Gemini API
const categorizeMaterial = async (name, description) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
      console.warn('⚠️  GEMINI_API_KEY not configured in .env');
      console.warn('To enable AI categorization, set GEMINI_API_KEY in Backend/.env');
      return {
        category: 'Equipment',
        tags: ['laboratory-equipment', 'general-purpose']
      };
    }

    const prompt = `Classify this lab item into EXACTLY ONE of: [Equipment, Consumable, Chemical, Tool, Electronic Component]. Also suggest 2-4 relevant tags based on the item name and description.
    
Item Name: ${name}
Description: ${description || 'No description provided'}

Respond ONLY with valid JSON:
{
  "category": "one_of_the_five_categories",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    console.log('🤖 AI Categorization request for:', name);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      { timeout: 10000 }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Invalid Gemini response structure');
      throw new Error('Invalid API response structure');
    }

    const text = response.data.candidates[0].content.parts[0].text;
    console.log('📝 Gemini response:', text.substring(0, 200));
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed category:', result.category, 'Tags:', result.tags);
      
      // Validate category is one of allowed values
      const validCategories = ['Equipment', 'Consumable', 'Chemical', 'Tool', 'Electronic Component'];
      if (!validCategories.includes(result.category)) {
        console.warn(`⚠️  Invalid category "${result.category}", using "Equipment"`);
        result.category = 'Equipment';
      }
      
      // Ensure tags is array
      if (!Array.isArray(result.tags)) {
        result.tags = ['laboratory-equipment'];
      }
      
      return result;
    }

    console.error('❌ Could not parse JSON from Gemini response');
    return {
      category: 'Equipment',
      tags: ['laboratory-equipment']
    };
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    if (error.response?.status === 401) {
      console.error('🔑 Invalid API key - check GEMINI_API_KEY');
    } else if (error.response?.status === 429) {
      console.error('⏱️  Rate limited');
    }
    return {
      category: 'Equipment',
      tags: ['laboratory-equipment']
    };
  }
};

// @desc    Categorize material using AI
// @route   POST /api/materials/categorize
// @access  Private (Lab Assistant only)
exports.categorizeMaterialHandler = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Material name is required' });
    }

    const result = await categorizeMaterial(name, description);
    res.json(result);
  } catch (error) {
    console.error('Categorize material error:', error);
    res.status(500).json({ message: 'Failed to categorize material' });
  }
};

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find().populate('lab', 'name').sort({ name: 1 });
    res.json({ materials });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('lab', 'name id');
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ material });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new material
// @route   POST /api/materials
// @access  Private (Lab Assistant only)
exports.addMaterial = async (req, res) => {
  try {
    const { name, description, quantity, labId } = req.body;

    // Validate required fields
    if (!name || !quantity || !labId) {
      return res.status(400).json({ message: 'name, quantity, and labId are required' });
    }

    // Find lab by string id ONLY (avoid ObjectId casting error)
    // Labs use string IDs like "computer-lab", not MongoDB ObjectIds
    const lab = await Lab.findOne({ id: labId });
    if (!lab) {
      console.error(`❌ Lab not found with id: ${labId}`);
      return res.status(404).json({ message: `Lab "${labId}" not found` });
    }
    
    console.log(`✓ Found lab: ${lab.name}`);

    // Use AI to categorize and tag
    const aiResult = await categorizeMaterial(name, description);

    const material = new Material({
      ...req.body,
      lab: lab._id,
      labId: labId,
      category: aiResult.category,
      tags: aiResult.tags,
      aiGenerated: true
    });

    await material.save();

    // Log the addition
    await UsageLog.create({
      material: material._id,
      quantity,
      action: 'added',
      performedBy: req.user._id
    });

    res.status(201).json({ material });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Lab Assistant only)
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ material });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Lab Assistant only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
