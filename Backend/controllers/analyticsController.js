const { GoogleGenerativeAI } = require('@google/generative-ai');
const Material = require('../models/Material');
const Lab = require('../models/Lab');
const Request = require('../models/Request');

// @desc    Generate AI Summary for Analytics
// @route   POST /api/analytics/generate-summary
// @access  Private
exports.generateAISummary = async (req, res) => {
  try {
    // Check if Gemini API is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_google_gemini_api_key_here') {
      return res.status(500).json({
        message: "AI service not configured. Please add GEMINI_API_KEY to environment variables."
      });
    }

    // Fetch all data for analysis
    const [materials, labs, requests] = await Promise.all([
      Material.find().populate('lab', 'name location'),
      Lab.find(),
      Request.find().populate('student', 'username').populate('material', 'name category')
    ]);

    // Calculate analytics
    const totalMaterials = materials.length;
    const totalQuantity = materials.reduce((sum, m) => sum + (m.quantity || 0), 0);
    
    // Stock status
    const stockStatus = materials.reduce((acc, m) => {
      if (m.quantity === 0) acc.outOfStock++;
      else if (m.quantity <= m.minThreshold) acc.lowStock++;
      else acc.inStock++;
      return acc;
    }, { inStock: 0, lowStock: 0, outOfStock: 0 });

    // Category breakdown
    const categoryMap = materials.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});

    // Lab distribution
    const labMap = materials.reduce((acc, m) => {
      const labName = m.lab?.name || 'Unknown';
      if (!acc[labName]) {
        acc[labName] = { items: 0, totalQty: 0 };
      }
      acc[labName].items++;
      acc[labName].totalQty += m.quantity || 0;
      return acc;
    }, {});

    // Request statistics
    const requestStats = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    // Critical items (low stock)
    const criticalItems = materials
      .filter(m => m.quantity > 0 && m.quantity <= m.minThreshold)
      .map(m => `${m.name} (${m.quantity}/${m.minThreshold} in ${m.lab?.name})`)
      .slice(0, 10);

    // Out of stock items
    const outOfStockItems = materials
      .filter(m => m.quantity === 0)
      .map(m => `${m.name} in ${m.lab?.name}`)
      .slice(0, 10);

    // Build analytics context for AI
    const analyticsContext = `
INVENTORY ANALYTICS DATA:

OVERALL STATISTICS:
- Total Materials: ${totalMaterials}
- Total Items in Stock: ${totalQuantity}
- In Stock: ${stockStatus.inStock} items (${((stockStatus.inStock/totalMaterials)*100).toFixed(1)}%)
- Low Stock: ${stockStatus.lowStock} items (${((stockStatus.lowStock/totalMaterials)*100).toFixed(1)}%)
- Out of Stock: ${stockStatus.outOfStock} items (${((stockStatus.outOfStock/totalMaterials)*100).toFixed(1)}%)

CATEGORY BREAKDOWN:
${Object.entries(categoryMap).map(([cat, count]) => `- ${cat}: ${count} items`).join('\n')}

LAB DISTRIBUTION:
${Object.entries(labMap).map(([lab, data]) => `- ${lab}: ${data.items} types, ${data.totalQty} total items`).join('\n')}

REQUEST STATISTICS:
${Object.entries(requestStats).map(([status, count]) => `- ${status}: ${count} requests`).join('\n')}

CRITICAL ITEMS (Low Stock):
${criticalItems.length > 0 ? criticalItems.map((item, i) => `${i+1}. ${item}`).join('\n') : 'None'}

OUT OF STOCK ITEMS:
${outOfStockItems.length > 0 ? outOfStockItems.map((item, i) => `${i+1}. ${item}`).join('\n') : 'None'}
`;

    // Generate AI summary
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an AI assistant analyzing laboratory inventory data. Based on the following analytics, provide a comprehensive summary with insights and recommendations.

${analyticsContext}

Generate a professional, well-structured summary that includes:

1. **Executive Summary** (2-3 sentences overview)
2. **Key Findings** (3-5 bullet points of most important observations)
3. **Stock Health Analysis** (assessment of overall inventory status)
4. **Critical Alerts** (urgent items needing attention)
5. **Recommendations** (3-5 actionable suggestions for improvement)
6. **Trend Insights** (patterns or concerns to monitor)

Use markdown formatting with headers (##), bold (**text**), and bullet points (-).
Be concise, professional, and actionable. Focus on insights that help lab managers make decisions.`;

    const result = await model.generateContent(prompt);
    const aiSummary = result.response.text();

    res.json({
      success: true,
      summary: aiSummary,
      generatedAt: new Date(),
      dataSnapshot: {
        totalMaterials,
        totalQuantity,
        stockStatus,
        criticalCount: criticalItems.length,
        outOfStockCount: outOfStockItems.length
      }
    });

  } catch (error) {
    console.error('AI Summary Generation Error:', error);
    res.status(500).json({
      message: 'Failed to generate AI summary',
      error: error.message
    });
  }
};

// @desc    Get Analytics Data
// @route   GET /api/analytics/data
// @access  Private
exports.getAnalyticsData = async (req, res) => {
  try {
    const [materials, labs, requests] = await Promise.all([
      Material.find().populate('lab', 'name location id'),
      Lab.find(),
      Request.find()
        .populate('student', 'username email')
        .populate('material', 'name category')
        .populate('lab', 'name')
    ]);

    res.json({
      success: true,
      data: {
        materials,
        labs,
        requests
      }
    });
  } catch (error) {
    console.error('Analytics Data Error:', error);
    res.status(500).json({
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};
