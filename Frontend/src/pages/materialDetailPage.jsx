import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { useAuth } from '../context/AuthContext';
import Header from './header';
import BackButton from '../components/BackButton';
import Footer from './footer';
import './CSS/materialDetail.css';
import './CSS/Blob.css';

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

  

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
    if (quantity < 10) return { text: 'Low Stock', class: 'low-stock' };
    return { text: 'In Stock', class: 'in-stock' };
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="material-detail-container">
          <div className="loading-state">
            <div className="spinner"></div>
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
        <div className="material-detail-container">
          <div className="error-message">
            <p>⚠️ {error || 'Material not found'}</p>
            <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const stockStatus = getStockStatus(material.quantity);

  return (
    <>
      <Header />
      <div className="page-wrapper material-detail-container">
          
        {/* Animated Background */}
      <div className="animated-bg">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

        <div className="material-detail-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="material-detail-grid">
            {/* Left Column - Image */}
            <div className="material-image-section">
              {material.image ? (
                <img src={material.image} alt={material.name} className="material-detail-image" />
              ) : (
                <div className="material-detail-placeholder">📦</div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="material-info-section">
              <h1 className="material-detail-title">{material.name}</h1>
              
              <div className="material-meta">
                <span className={`stock-status ${stockStatus.class}`}>
                  {stockStatus.text}
                </span>
                <span className="quantity-info">Quantity: {material.quantity}</span>
              </div>

              {material.category && (
                <div className="category-section">
                  <h3>Category</h3>
                  <span className="category-badge-large">{material.category}</span>
                </div>
              )}

              <div className="description-section">
                <h3>Description</h3>
                <p>{material.description || 'No description available'}</p>
              </div>

              {material.specifications && (
                <div className="specifications-section">
                  <h3>Specifications</h3>
                  <ul>
                    {Object.entries(material.specifications).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {material.tags && material.tags.length > 0 && (
                <div className="tags-section">
                  <h3>AI-Generated Tags</h3>
                  <div className="tags-list">
                    {material.tags.map((tag, index) => (
                      <span key={index} className="tag-large">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {material.lastRestockDate && (
                <div className="restock-info">
                  <p>Last Restocked: {new Date(material.lastRestockDate).toLocaleDateString()}</p>
                </div>
              )}

              {material.usageStats && (
                <div className="usage-stats">
                  <h3>Usage Statistics</h3>
                  <p>Average Weekly Usage: {material.usageStats.weeklyAverage || 0} units</p>
                  {material.usageStats.projectedDepletion && (
                    <p className="depletion-warning">
                      ⚠️ Projected depletion in {material.usageStats.projectedDepletion} days
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons based on Role */}
              <div className="action-buttons">
                {role === 'student' && material.quantity > 0 && (
                  <button className="primary-btn" onClick={handleRequestMaterial}>
                    Request This Material
                  </button>
                )}
                
                

                {role === 'student' && material.quantity === 0 && (
                  <button className="disabled-btn" disabled>
                    Currently Unavailable
                  </button>
                )}
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
