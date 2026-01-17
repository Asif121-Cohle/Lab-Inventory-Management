import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./header";
import Footer from "./footer";
import "./CSS/header.css";
import "./CSS/dashboard.css";
import "./CSS/Blob.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const labs = [
    {
      id: "computer-lab",
      name: "Computer Lab",
      image: "/images/compiler.png",
      description: "Computer hardware, networking equipment, and programming accessories",
      icon: "💻",
      items: "50+ items",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: "physics-lab",
      name: "Physics Lab",
      image: "/images/ee.jpg",
      description: "Physics instruments, measurement tools, and experimental apparatus",
      icon: "⚗️",
      items: "40+ items",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: "electronics-lab",
      name: "Electronics Lab",
      image: "/images/machine.jpg",
      description: "Electronic components, circuit boards, and testing equipment",
      icon: "🔌",
      items: "60+ items",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  const features = [
    {
      icon: "🔍",
      title: "Smart Search",
      description: "Find materials instantly with AI-powered search and filters"
    },
    {
      icon: "📦",
      title: "Real-time Inventory",
      description: "Track stock levels and get alerts for low inventory items"
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description: "Get instant help with our conversational AI chatbot"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "View usage patterns and optimize resource allocation"
    }
  ];

  const stats = [
    { label: "Total Labs", value: "3", icon: "🏢" },
    { label: "Materials", value: "150+", icon: "📦" },
    { label: "Active Users", value: "200+", icon: "👥" },
    { label: "Requests Today", value: "45", icon: "📝" }
  ];

  const handleLabClick = (labId) => {
    navigate(`/lab/${labId}`);
  };

  return (
    <div className="page-wrapper dashboard-page">
      <div className="animated-bg">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <div className="dashboard-content">
        <Header />
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to Lab Inventory
              <span className="gradient-text"> Management System</span>
            </h1>
            <p className="hero-subtitle">
              Streamline your laboratory operations with intelligent inventory tracking,
              AI-powered assistance, and real-time collaboration.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/request-material')}>
                🔍 Browse Materials
              </button>
              <button className="btn-secondary" onClick={() => navigate('/schedule-lab')}>
                📅 Schedule Lab
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Labs Section */}
        <section className="labs-section">
          <div className="section-header">
            <h2 className="section-title">Explore Our Labs</h2>
            <p className="section-subtitle">
              Access state-of-the-art facilities and equipment across our laboratory network
            </p>
          </div>
          <div className="labs-grid">
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="lab-card"
                onClick={() => handleLabClick(lab.id)}
              >
                <div className="lab-card-image">
                  <img src={lab.image} alt={lab.name} />
                  <div className="lab-card-overlay" style={{ background: lab.gradient }}>
                    <span className="lab-icon">{lab.icon}</span>
                  </div>
                </div>
                <div className="lab-card-content">
                  <div className="lab-card-header">
                    <h3 className="lab-name">{lab.name}</h3>
                    <span className="lab-items-badge">{lab.items}</span>
                  </div>
                  <p className="lab-description">{lab.description}</p>
                  <button className="lab-explore-btn">
                    Explore Lab →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to manage laboratory resources efficiently
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="quick-actions-section">
          <div className="quick-actions-container">
            <h2 className="quick-actions-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <div className="quick-action-card" onClick={() => navigate('/request-material')}>
                <div className="quick-action-icon">📋</div>
                <div className="quick-action-text">
                  <h4>Request Materials</h4>
                  <p>Submit new material requests</p>
                </div>
              </div>
              {user?.role === 'professor' && (
                <div className="quick-action-card" onClick={() => navigate('/schedule-lab')}>
                  <div className="quick-action-icon">🗓️</div>
                  <div className="quick-action-text">
                    <h4>Schedule Lab</h4>
                    <p>Book lab sessions</p>
                  </div>
                </div>
              )}
              {user?.role === 'lab_assistant' && (
                <div className="quick-action-card" onClick={() => navigate('/approve-request')}>
                  <div className="quick-action-icon">✅</div>
                  <div className="quick-action-text">
                    <h4>Approve Requests</h4>
                    <p>Review pending requests</p>
                  </div>
                </div>
              )}
              <div className="quick-action-card" onClick={() => navigate('/request-status')}>
                <div className="quick-action-icon">📊</div>
                <div className="quick-action-text">
                  <h4>Track Status</h4>
                  <p>View request history</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardPage;
