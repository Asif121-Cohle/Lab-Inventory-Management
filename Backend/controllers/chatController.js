const { GoogleGenerativeAI } = require('@google/generative-ai');
const Material = require('../models/Material');
const Lab = require('../models/Lab');

// @desc    AI Chat Assistant
// @route   POST /api/chat
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if Gemini API is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
      return res.json({
        response: "I'm currently unavailable. Please configure the Gemini API key to use the chat assistant.",
        aiPowered: false
      });
    }

    // Get all labs and materials for context
    const labs = await Lab.find().select('id name location capacity');
    const materials = await Material.find()
      .populate('lab', 'name id')
      .select('name category description tags quantity minThreshold lab');

    // Build context
    const labsList = labs.map(l => `${l.name} (${l.id}) - ${l.location}, Capacity: ${l.capacity}`).join('\n');
    const materialsList = materials.slice(0, 30).map(m => 
      `${m.name} | ${m.category} | Lab: ${m.lab?.name || 'N/A'} | Qty: ${m.quantity} | Tags: ${m.tags.join(', ')}`
    ).join('\n');

    // Build conversation history
    // Separate user and assistant messages for better context
    let historyText = '';
    if (conversationHistory.length > 0) {
      const userMsgs = conversationHistory.filter(msg => msg.role === 'user').slice(-4);
      const assistantMsgs = conversationHistory.filter(msg => msg.role === 'assistant').slice(-2);
      
      // Combine and maintain chronological order
      const allMessages = [...userMsgs, ...assistantMsgs]
        .sort((a, b) => conversationHistory.indexOf(a) - conversationHistory.indexOf(b));
      
      historyText = '\n\nPREVIOUS CONVERSATION:\n' + 
        allMessages.map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
    }

    const systemPrompt = `You are LabBot, an intelligent AI assistant for a Lab Inventory Management System. You help students, professors, and lab assistants find materials, answer questions about lab equipment, and provide guidance.

SYSTEM INFORMATION:
- This is a lab inventory system with 3 labs
- Users can request materials, schedule labs, and browse inventory
- You have access to current inventory data

AVAILABLE LABS:
${labsList}

SAMPLE MATERIALS (showing first 30):
${materialsList}

YOUR CAPABILITIES:
1. Help users find materials by name, category, or use case
2. Answer questions about inventory, availability, and lab locations
3. Suggest materials for projects (e.g., "What do I need for an LED circuit?")
4. Explain how to use the system (request materials, schedule labs, etc.)
5. Provide friendly, conversational responses

RESPONSE STYLE:
- Be friendly, helpful, and concise (2-3 sentences max)
- Use emojis sparingly for personality (🔬, 🔧, 💡, ✅)
- If suggesting materials, format as: "Try looking for [Material Name] in [Lab Name]"
- If you don't know something, admit it and suggest alternatives
- Never make up material names that don't exist in the inventory

IMPORTANT:
- Keep responses SHORT and conversational
- Focus on being helpful, not verbose
${historyText}

USER MESSAGE: "${message}"

Respond naturally and helpfully:`;

    console.log('💬 Chat request:', message);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const aiResponse = response.text();

    console.log('✅ Chat response generated');

    // Check if AI mentioned specific materials - we can return them as cards
    const mentionedMaterials = materials.filter(m => 
      aiResponse.toLowerCase().includes(m.name.toLowerCase())
    ).slice(0, 3);

    res.json({
      response: aiResponse.trim(),
      aiPowered: true,
      suggestedMaterials: mentionedMaterials.length > 0 ? mentionedMaterials : undefined
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: 'Chat service error',
      response: "Sorry, I encountered an error. Please try again.",
      aiPowered: false
    });
  }
};

// @desc    Get quick suggestions
// @route   GET /api/chat/suggestions
// @access  Private
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "What materials are available?",
      "Help me find Arduino components",
      "How do I request materials?",
      "Show me what's in the Electronics Lab",
      "What do I need for a robotics project?"
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
};
