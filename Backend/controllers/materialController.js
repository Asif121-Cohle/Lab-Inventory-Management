const Material = require('../models/Material');
const Lab = require('../models/Lab');
const UsageLog = require('../models/UsageLog');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

    const prompt = `You are a lab inventory categorization expert.

TASK 1: Classify the item into EXACTLY ONE category: [Equipment, Consumable, Chemical, Tool, Electronic Component]

TASK 2: Extract 2-5 relevant tags based on KEYWORDS from the description. Tags should be:
- Specific keywords/phrases extracted from the description
- Include synonyms or related terms
- Use hyphenated phrases for multi-word concepts (e.g., "car-motorcycle-battery")
- Focus on descriptive attributes, materials, purpose, or application areas
- Be specific and meaningful (not generic)

Example: If description mentions "car, motorcycle, batteries, automotive energy solutions"
Extract tags like: ["car-motorcycle-battery", "automotive-energy", "power-storage", "vehicle-electronics"]

Item Name: ${name}
Description: ${description || 'No description provided'}

Respond ONLY with valid JSON, no markdown or code blocks:
{
  "category": "one_of_the_five_categories",
  "tags": ["keyword-phrase-1", "keyword-phrase-2", "keyword-phrase-3"]
}`;

    console.log('🤖 AI Categorization request for:', name);
    console.log('📋 Description analyzed:', description ? description.substring(0, 100) + '...' : 'None');
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Generate content (non-streaming)
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('📝 Gemini response:', text.substring(0, 200));
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed category:', parsedResult.category, 'Tags:', parsedResult.tags);
      
      // Validate category is one of allowed values
      const validCategories = ['Equipment', 'Consumable', 'Chemical', 'Tool', 'Electronic Component'];
      if (!validCategories.includes(parsedResult.category)) {
        console.warn(`⚠️  Invalid category "${parsedResult.category}", using "Equipment"`);
        parsedResult.category = 'Equipment';
      }
      
      // Ensure tags is array and has meaningful values
      if (!Array.isArray(parsedResult.tags)) {
        parsedResult.tags = ['laboratory-equipment'];
      } else if (parsedResult.tags.length === 0) {
        parsedResult.tags = ['laboratory-equipment'];
      }
      
      // Clean up tags (remove empty strings, convert to lowercase with hyphens)
      parsedResult.tags = parsedResult.tags
        .filter(tag => tag && tag.trim())
        .map(tag => tag.toLowerCase().trim());
      
      console.log('🏷️  Final tags:', parsedResult.tags);
      return parsedResult;
    }

    console.error('❌ Could not parse JSON from Gemini response');
    return {
      category: 'Equipment',
      tags: ['laboratory-equipment']
    };
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    if (error.message?.includes('API_KEY')) {
      console.error('🔑 Invalid API key - check GEMINI_API_KEY');
    } else if (error.message?.includes('quota')) {
      console.error('⏱️  Rate limited or quota exceeded');
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

    const categorization = await categorizeMaterial(name, description);
    res.json(categorization);
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ message: error.message || 'Failed to categorize material' });
  }
};

// @desc    Add material to lab
// @route   POST /api/materials
// @access  Private (Lab Assistant only)
exports.addMaterial = async (req, res) => {
  try {
    const { name, description, quantity, labId, category, tags } = req.body;

    // Validation
    if (!name || !labId) {
      return res.status(400).json({ message: 'Material name and lab are required' });
    }

    // Find lab with id field (string-based)
    const lab = await Lab.findOne({ id: labId });
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Use provided category/tags or generate with AI
    let finalCategory = category;
    let finalTags = tags;

    if (!category || !tags || tags.length === 0) {
      console.log('🤖 Generating AI categorization...');
      const aiResult = await categorizeMaterial(name, description);
      finalCategory = aiResult.category;
      finalTags = aiResult.tags;
    }

    const material = new Material({
      name,
      description,
      quantity: quantity || 0,
      lab: lab._id,
      labId: lab.id,
      category: finalCategory,
      tags: finalTags
    });

    await material.save();

    await material.populate('lab', 'name');

    res.status(201).json({ 
      message: 'Material added successfully',
      material,
      aiGenerated: !category || !tags
    });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all materials
// @route   GET /api/materials
// @access  Public
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('lab', 'name id')
      .sort({ createdAt: -1 });

    res.json({ materials });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Public
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('lab', 'name id');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ material });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Lab Assistant only)
exports.updateMaterial = async (req, res) => {
  try {
    const { name, description, quantity, category, tags } = req.body;

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // If any field is being updated, regenerate AI tags if not provided
    if ((name || description) && (!category || !tags || tags.length === 0)) {
      console.log('🤖 Regenerating AI categorization for update...');
      const aiResult = await categorizeMaterial(name || material.name, description || material.description);
      material.category = aiResult.category;
      material.tags = aiResult.tags;
    } else {
      if (name) material.name = name;
      if (description) material.description = description;
      if (category) material.category = category;
      if (tags) material.tags = tags;
    }

    if (quantity !== undefined) material.quantity = quantity;

    await material.save();

    await material.populate('lab', 'name id');

    res.json({ 
      message: 'Material updated successfully',
      material 
    });
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

// @desc    Get materials by lab
// @route   GET /api/labs/:labId/materials
// @access  Public
exports.getMaterialsByLab = async (req, res) => {
  try {
    const { labId } = req.params;

    // Find lab by ID string
    const lab = await Lab.findOne({ id: labId });
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const materials = await Material.find({ lab: lab._id })
      .sort({ createdAt: -1 });

    res.json({ materials });
  } catch (error) {
    console.error('Get materials by lab error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Log material usage
// @route   POST /api/materials/:id/usage
// @access  Private (Student only)
exports.logMaterialUsage = async (req, res) => {
  try {
    const { quantity, purpose } = req.body;
    const { id } = req.params;

    // Validation
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Create usage log
    const usageLog = new UsageLog({
      material: id,
      student: req.user._id,
      quantity,
      purpose,
      timestamp: new Date()
    });

    await usageLog.save();

    // Decrease material quantity
    material.quantity -= quantity;
    await material.save();

    res.json({ 
      message: 'Material usage logged successfully',
      usageLog,
      remainingQuantity: material.quantity
    });
  } catch (error) {
    console.error('Log usage error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get usage logs for a material
// @route   GET /api/materials/:id/usage-logs
// @access  Private
exports.getMaterialUsageLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const usageLogs = await UsageLog.find({ material: id })
      .populate('student', 'username email')
      .populate('material', 'name')
      .sort({ timestamp: -1 });

    res.json({ usageLogs });
  } catch (error) {
    console.error('Get usage logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
