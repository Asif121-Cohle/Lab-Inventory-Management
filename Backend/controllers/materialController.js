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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    // Generate content (non-streaming)
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
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
      
      // Ensure tags is array and has meaningful values
      if (!Array.isArray(result.tags)) {
        result.tags = ['laboratory-equipment'];
      } else if (result.tags.length === 0) {
        result.tags = ['laboratory-equipment'];
      }
      
      // Clean up tags (remove empty strings, convert to lowercase with hyphens)
      result.tags = result.tags
        .filter(tag => tag && tag.trim())
        .map(tag => tag.toLowerCase().trim());
      
      console.log('🏷️  Final tags:', result.tags);
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

// @desc    AI-powered natural language search
// @route   POST /api/materials/search
// @access  Private
exports.aiSearchMaterials = async (req, res) => {
  try {
    const { query, labId } = req.body;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({ 
        message: 'Search query must be at least 3 characters' 
      });
    }

    // Get materials based on lab filter
    let materialsQuery = {};
    
    if (labId) {
      // Find lab by string id (e.g., "electronics-lab"), not ObjectId
      const lab = await Lab.findOne({ id: labId });
      if (!lab) {
        return res.status(404).json({ message: 'Lab not found' });
      }
      materialsQuery = { lab: lab._id }; // Use the ObjectId
    }
    
    const allMaterials = await Material.find(materialsQuery)
      .populate('lab', 'name id')
      .select('name description category tags quantity minThreshold');

    if (allMaterials.length === 0) {
      return res.json({ materials: [], filters: {}, aiPowered: false });
    }

    // Check if Gemini API is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
      // Fallback: Simple keyword search
      const keywords = query.toLowerCase().split(/\s+/);
      const filtered = allMaterials.filter(m => {
        const searchText = `${m.name} ${m.description} ${m.category} ${m.tags.join(' ')}`.toLowerCase();
        return keywords.some(keyword => searchText.includes(keyword));
      });

      return res.json({ 
        materials: filtered, 
        filters: { keywords },
        aiPowered: false,
        message: 'Keyword search (AI not configured)'
      });
    }

    // Use AI to understand search intent
    const materialsList = allMaterials.map(m => 
      `${m.name} | ${m.category} | ${m.description || 'N/A'} | Tags: ${m.tags.join(', ')}`
    ).join('\n');

    const prompt = `You are a lab inventory search assistant. Parse the natural language search query and return matching materials.

USER QUERY: "${query}"

AVAILABLE MATERIALS:
${materialsList}

TASK:
1. Understand search intent (looking for specific items, categories, tags, use cases, price ranges, etc.)
2. Return material names that match the query
3. Suggest category/tag filters if applicable

Respond ONLY with valid JSON:
{
  "intent": "brief description of what user wants",
  "matchedMaterials": ["exact material name 1", "exact material name 2"],
  "suggestedFilters": {
    "categories": ["category1"],
    "tags": ["tag1", "tag2"]
  }
}

If query is vague or no matches, return empty matchedMaterials array.`;

    console.log('🔍 AI Search query:', query);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('📝 AI Search response received');

    // Parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Match AI suggestions with actual materials
    let filteredMaterials = allMaterials;

    if (aiResponse.matchedMaterials && aiResponse.matchedMaterials.length > 0) {
      filteredMaterials = allMaterials.filter(m => 
        aiResponse.matchedMaterials.some(name => 
          m.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(m.name.toLowerCase())
        )
      );
    }

    // Apply category filters if suggested
    if (aiResponse.suggestedFilters?.categories?.length > 0) {
      const categoryMatches = allMaterials.filter(m => 
        aiResponse.suggestedFilters.categories.includes(m.category)
      );
      filteredMaterials = [...new Set([...filteredMaterials, ...categoryMatches])];
    }

    // Apply tag filters if suggested
    if (aiResponse.suggestedFilters?.tags?.length > 0) {
      const tagMatches = allMaterials.filter(m => 
        m.tags && aiResponse.suggestedFilters.tags.some(tag => 
          m.tags.some(mtag => mtag.toLowerCase().includes(tag.toLowerCase()))
        )
      );
      filteredMaterials = [...new Set([...filteredMaterials, ...tagMatches])];
    }

    // Remove duplicates
    filteredMaterials = Array.from(new Set(filteredMaterials));

    console.log(`✅ Found ${filteredMaterials.length} materials matching: "${query}"`);

    res.json({ 
      materials: filteredMaterials,
      intent: aiResponse.intent,
      filters: aiResponse.suggestedFilters || {},
      aiPowered: true,
      totalResults: filteredMaterials.length
    });

  } catch (error) {
    console.error('AI search error:', error);
    
    // Fallback to keyword search
    const keywords = req.body.query.toLowerCase().split(/\s+/);
    let materialsQuery = {};
    
    if (req.body.labId) {
      const lab = await Lab.findOne({ id: req.body.labId });
      if (lab) {
        materialsQuery = { lab: lab._id };
      }
    }
    
    const allMaterials = await Material.find(materialsQuery)
      .populate('lab', 'name id')
      .select('name description category tags quantity minThreshold');

    const filtered = allMaterials.filter(m => {
      const searchText = `${m.name} ${m.description} ${m.category} ${m.tags.join(' ')}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword));
    });

    res.json({ 
      materials: filtered,
      filters: { keywords },
      aiPowered: false,
      message: 'Fallback keyword search',
      totalResults: filtered.length
    });
  }
};
