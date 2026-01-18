import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { materialAPI, labAPI, requestAPI, analyticsAPI } from '../services/api';
import Header from './header';
import Footer from './footer';
import './CSS/analytics.css';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [labs, setLabs] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Analytics data states
  const [categoryData, setCategoryData] = useState([]);
  const [labInventoryData, setLabInventoryData] = useState([]);
  const [stockStatusData, setStockStatusData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [requestTrendData, setRequestTrendData] = useState([]);
  const [topMaterials, setTopMaterials] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [materialsRes, labsRes] = await Promise.all([
        materialAPI.getAllMaterials(),
        labAPI.getAllLabs()
      ]);

      const materialsData = materialsRes.data.materials || materialsRes.data;
      const labsData = labsRes.data.labs || labsRes.data;
      
      setMaterials(materialsData);
      setLabs(labsData);

      // Try to fetch requests (may fail for students without access)
      try {
        const requestsRes = await requestAPI.getAllRequests();
        setRequests(requestsRes.data.requests || requestsRes.data || []);
      } catch (error) {
        console.log('Unable to fetch requests:', error);
        setRequests([]);
      }

      // Process data for analytics
      processAnalyticsData(materialsData, labsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const processAnalyticsData = (materialsData, labsData) => {
    // 1. Category Distribution
    const categoryMap = {};
    materialsData.forEach(material => {
      categoryMap[material.category] = (categoryMap[material.category] || 0) + 1;
    });
    const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / materialsData.length) * 100).toFixed(1)
    }));
    setCategoryData(categoryChartData);

    // 2. Lab Inventory Distribution
    const labMap = {};
    materialsData.forEach(material => {
      const labName = material.lab?.name || 'Unknown';
      if (!labMap[labName]) {
        labMap[labName] = { name: labName, items: 0, totalQuantity: 0 };
      }
      labMap[labName].items += 1;
      labMap[labName].totalQuantity += material.quantity || 0;
    });
    setLabInventoryData(Object.values(labMap));

    // 3. Stock Status
    let inStock = 0, lowStock = 0, outOfStock = 0;
    materialsData.forEach(material => {
      if (material.quantity === 0) outOfStock++;
      else if (material.quantity <= material.minThreshold) lowStock++;
      else inStock++;
    });
    setStockStatusData([
      { name: 'In Stock', value: inStock, color: '#43e97b' },
      { name: 'Low Stock', value: lowStock, color: '#fee140' },
      { name: 'Out of Stock', value: outOfStock, color: '#fa709a' }
    ]);

    // 4. Low Stock Items
    const lowStockList = materialsData
      .filter(m => m.quantity > 0 && m.quantity <= m.minThreshold)
      .sort((a, b) => (a.quantity / a.minThreshold) - (b.quantity / b.minThreshold))
      .slice(0, 5);
    setLowStockItems(lowStockList);

    // 5. Top Materials by Quantity
    const topItems = [...materialsData]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
      .map(m => ({
        name: m.name.length > 20 ? m.name.substring(0, 20) + '...' : m.name,
        quantity: m.quantity,
        lab: m.lab?.name || 'N/A'
      }));
    setTopMaterials(topItems);

    // 6. Request Trends (mock data for now - will be replaced with real data)
    const mockTrendData = [
      { month: 'Jan', requests: 45, approved: 38, rejected: 7 },
      { month: 'Feb', requests: 52, approved: 45, rejected: 7 },
      { month: 'Mar', requests: 48, approved: 42, rejected: 6 },
      { month: 'Apr', requests: 61, approved: 55, rejected: 6 },
      { month: 'May', requests: 58, approved: 50, rejected: 8 },
      { month: 'Jun', requests: 65, approved: 59, rejected: 6 }
    ];
    setRequestTrendData(mockTrendData);
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      setSummaryError(null);
      
      const response = await analyticsAPI.generateSummary();
      setAiSummary(response.data);
      
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      setSummaryError(error.response?.data?.message || 'Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{`Value: ${payload[0].value}`}</p>
          {payload[0].payload.percentage && (
            <p className="tooltip-percentage">{`${payload[0].payload.percentage}%`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="animated-bg">
          <div className="blob"></div>
          <div className="blob"></div>
          <div className="blob"></div>
        </div>
        <div className="analytics-content">
          <Header />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="animated-bg">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="analytics-content">
        <Header />

        {/* Page Header */}
        <div className="analytics-header">
          <div className="analytics-header-content">
            <h1 className="analytics-title">
              📊 Inventory Analytics
            </h1>
            <p className="analytics-subtitle">
              Comprehensive insights into your laboratory inventory and usage patterns
            </p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <section className="metrics-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📦</div>
              <div className="metric-content">
                <div className="metric-value">{materials.length}</div>
                <div className="metric-label">Total Materials</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🏢</div>
              <div className="metric-content">
                <div className="metric-value">{labs.length}</div>
                <div className="metric-label">Active Labs</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⚠️</div>
              <div className="metric-content">
                <div className="metric-value">{lowStockItems.length}</div>
                <div className="metric-label">Low Stock Alerts</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <div className="metric-value">
                  {materials.reduce((sum, m) => sum + (m.quantity || 0), 0)}
                </div>
                <div className="metric-label">Total Items in Stock</div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <div className="charts-container">
          
          {/* Row 1: Category Distribution & Stock Status */}
          <div className="chart-row">
            <div className="chart-card">
              <h3 className="chart-title">📊 Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">⚡ Stock Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Lab Distribution & Top Materials */}
          <div className="chart-row">
            <div className="chart-card">
              <h3 className="chart-title">🏢 Inventory by Lab</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={labInventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#ffffff" />
                  <YAxis stroke="#ffffff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="items" fill="#667eea" name="Material Types" />
                  <Bar dataKey="totalQuantity" fill="#43e97b" name="Total Quantity" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">🔝 Top Materials by Quantity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topMaterials} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#ffffff" />
                  <YAxis dataKey="name" type="category" stroke="#ffffff" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Bar dataKey="quantity" fill="#4facfe" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Request Trends */}
          <div className="chart-row">
            <div className="chart-card full-width">
              <h3 className="chart-title">📈 Request Trends (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={requestTrendData}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#43e97b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fa709a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#fa709a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#ffffff" />
                  <YAxis stroke="#ffffff" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="requests" stroke="#667eea" fillOpacity={1} fill="url(#colorRequests)" name="Total Requests" />
                  <Area type="monotone" dataKey="approved" stroke="#43e97b" fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                  <Area type="monotone" dataKey="rejected" stroke="#fa709a" fillOpacity={1} fill="url(#colorRejected)" name="Rejected" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <section className="alerts-section">
            <h2 className="section-title">⚠️ Low Stock Alerts</h2>
            <div className="alerts-grid">
              {lowStockItems.map((item, index) => (
                <div 
                  key={item._id} 
                  className="alert-card"
                  onClick={() => navigate(`/material/${item._id}`)}
                >
                  <div className="alert-header">
                    <span className="alert-rank">#{index + 1}</span>
                    <span className="alert-badge">Low Stock</span>
                  </div>
                  <h4 className="alert-title">{item.name}</h4>
                  <div className="alert-details">
                    <div className="alert-detail">
                      <span className="detail-label">Current:</span>
                      <span className="detail-value">{item.quantity}</span>
                    </div>
                    <div className="alert-detail">
                      <span className="detail-label">Minimum:</span>
                      <span className="detail-value">{item.minThreshold}</span>
                    </div>
                    <div className="alert-detail">
                      <span className="detail-label">Lab:</span>
                      <span className="detail-value">{item.lab?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="alert-progress">
                    <div 
                      className="alert-progress-bar"
                      style={{ 
                        width: `${(item.quantity / item.minThreshold) * 100}%`,
                        backgroundColor: item.quantity / item.minThreshold < 0.5 ? '#fa709a' : '#fee140'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Summary Section */}
        <section className="ai-summary-section">
          <div className="ai-summary-card">
            <div className="ai-summary-header">
              <h2 className="ai-summary-title">🤖 AI-Generated Insights</h2>
              {!aiSummary && !generatingSummary && (
                <button 
                  className="ai-summary-btn primary"
                  onClick={handleGenerateSummary}
                >
                  ✨ Generate AI Summary
                </button>
              )}
              {generatingSummary && (
                <span className="generating-badge">Generating...</span>
              )}
            </div>

            {!aiSummary && !generatingSummary && !summaryError && (
              <p className="ai-summary-description">
                Get intelligent summaries and recommendations based on your inventory data. 
                AI will analyze trends, predict stock needs, and provide actionable insights.
              </p>
            )}

            {summaryError && (
              <div className="summary-error">
                <p>❌ {summaryError}</p>
                <button 
                  className="ai-summary-btn secondary"
                  onClick={handleGenerateSummary}
                >
                  Try Again
                </button>
              </div>
            )}

            {generatingSummary && (
              <div className="summary-loading">
                <div className="loading-spinner"></div>
                <p>Analyzing inventory data and generating insights...</p>
              </div>
            )}

            {aiSummary && (
              <div className="summary-content">
                <div className="summary-meta">
                  <span className="summary-timestamp">
                    Generated: {new Date(aiSummary.generatedAt).toLocaleString()}
                  </span>
                  <button 
                    className="regenerate-btn"
                    onClick={handleGenerateSummary}
                    disabled={generatingSummary}
                  >
                    🔄 Regenerate
                  </button>
                </div>
                
                <div 
                  className="summary-text"
                  dangerouslySetInnerHTML={{ 
                    __html: aiSummary.summary
                      .replace(/\n/g, '<br/>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^## (.*?)$/gm, '<h3>$1</h3>')
                      .replace(/^- (.*?)$/gm, '<li>$1</li>')
                      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                  }}
                />

                {aiSummary.dataSnapshot && (
                  <div className="data-snapshot">
                    <h4>📊 Data Snapshot</h4>
                    <div className="snapshot-grid">
                      <div className="snapshot-item">
                        <span className="snapshot-label">Materials Analyzed</span>
                        <span className="snapshot-value">{aiSummary.dataSnapshot.totalMaterials}</span>
                      </div>
                      <div className="snapshot-item">
                        <span className="snapshot-label">Total Quantity</span>
                        <span className="snapshot-value">{aiSummary.dataSnapshot.totalQuantity}</span>
                      </div>
                      <div className="snapshot-item">
                        <span className="snapshot-label">Critical Alerts</span>
                        <span className="snapshot-value alert">{aiSummary.dataSnapshot.criticalCount}</span>
                      </div>
                      <div className="snapshot-item">
                        <span className="snapshot-label">Out of Stock</span>
                        <span className="snapshot-value danger">{aiSummary.dataSnapshot.outOfStockCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default AnalyticsPage;
