import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { useAuth } from '../context/AuthContext';
import Header from './header';
import Footer from './footer';
import './CSS/materialDetail.css';

const MaterialDetailPage = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const { fetchMaterialById, loading } = useLab();
  const { role } = useAuth();
  const [material, setMaterial] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMaterial();
  }, [materialId]);

  const loadMaterial = async () => {
    setError(null);
    const data = await fetchMaterialById(materialId);
    if (data) {
      setMaterial(data);
    } else {
      setError('Material not found');
    }
  };

  const handleRequestMaterial = () => {
    navigate('/request-material', { state: { materialId, materialName: material.name } });
  };

  const getStockStatus = (quantity, minThreshold = 0) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'status-out', icon: '❌' };
    if (quantity <= minThreshold) return { text: 'Low Stock', class: 'status-low', icon: '⚠️' };
    return { text: 'In Stock', class: 'status-in', icon: '✅' };
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="material-detail-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading material details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !material) {
    return (
      <>
        <Header />
        <div className="material-detail-page">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>{error || 'Material not found'}</h2>
            <button onClick={() => navigate(-1)} className="back-button">
              ← Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const stockStatus = getStockStatus(material.quantity, material.minThreshold);

  return (
    <>
      <Header />
      <div className="material-detail-page">
        {/* Hero Section */}
        <div className="material-hero">
          <button className="back-floating-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          
          <div className="hero-content">
            <div className="hero-left">
              <div className="material-icon-container">
                {material.image ? (
                  <img src={material.image} alt={material.name} className="material-hero-image" />
                ) : (
                  <div className="material-hero-icon">
                    {material.category === 'Electronic Component' ? '🔌' :
                     material.category === 'Equipment' ? '🔧' :
                     material.category === 'Chemical' ? '🧪' :
                     material.category === 'Tool' ? '🛠️' :
                     material.category === 'Consumable' ? '📦' : '⚙️'}
                  </div>
                )}
              </div>
            </div>

            <div className="hero-right">
              <div className="material-header">
                <h1 className="material-title">{material.name}</h1>
                <div className={`stock-badge ${stockStatus.class}`}>
                  <span className="badge-icon">{stockStatus.icon}</span>
                  <span className="badge-text">{stockStatus.text}</span>
                </div>
              </div>

              <div className="material-meta-row">
                {material.category && (
                  <div className="meta-item">
                    <span className="meta-label">Category</span>
                    <span className="meta-value category-pill">{material.category}</span>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-label">Lab Location</span>
                  <span className="meta-value">{material.lab?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="quantity-display">
                <div className="quantity-box">
                  <span className="quantity-label">Available</span>
                  <span className="quantity-number">{material.quantity}</span>
                  <span className="quantity-unit">units</span>
                </div>
                {material.minThreshold > 0 && (
                  <div className="threshold-box">
                    <span className="threshold-label">Min. Threshold</span>
                    <span className="threshold-number">{material.minThreshold}</span>
                  </div>
                )}
              </div>

              {role === 'student' && (
                <div className="action-section">
                  {material.quantity > 0 ? (
                    <button className="request-button" onClick={handleRequestMaterial}>
                      <span className="btn-icon">📋</span>
                      Request This Material
                    </button>
                  ) : (
                    <button className="request-button disabled" disabled>
                      <span className="btn-icon">🚫</span>
                      Currently Unavailable
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="material-details-container">
          <div className="details-grid">
            {/* Description Card */}
            <div className="detail-card description-card">
              <div className="card-header">
                <span className="card-icon">📝</span>
                <h2>Description</h2>
              </div>
              <div className="card-body">
                <p>{material.description || 'No description available for this material.'}</p>
              </div>
            </div>

            {/* Tags Card */}
            {material.tags && material.tags.length > 0 && (
              <div className="detail-card tags-card">
                <div className="card-header">
                  <span className="card-icon">🏷️</span>
                  <h2>Tags</h2>
                  {material.aiGenerated && (
                    <span className="ai-badge">AI Generated</span>
                  )}
                </div>
                <div className="card-body">
                  <div className="tags-grid">
                    {material.tags.map((tag, index) => (
                      <span key={index} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Card */}
            {material.specifications && Object.keys(material.specifications).length > 0 && (
              <div className="detail-card specs-card">
                <div className="card-header">
                  <span className="card-icon">⚙️</span>
                  <h2>Specifications</h2>
                </div>
                <div className="card-body">
                  <div className="specs-list">
                    {Object.entries(material.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-key">{key}</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="detail-card info-card">
              <div className="card-header">
                <span className="card-icon">ℹ️</span>
                <h2>Additional Information</h2>
              </div>
              <div className="card-body">
                <div className="info-list">
                  {material.lastRestockDate && (
                    <div className="info-item">
                      <span className="info-label">Last Restocked</span>
                      <span className="info-value">
                        {new Date(material.lastRestockDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Material ID</span>
                    <span className="info-value monospace">{material._id}</span>
                  </div>
                  {material.createdAt && (
                    <div className="info-item">
                      <span className="info-label">Added On</span>
                      <span className="info-value">
                        {new Date(material.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MaterialDetailPage;
