import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { useAuth } from '../context/AuthContext';
import Header from './header';
import Footer from './footer';
import AddItemModal from './addItemModal';
import AddItemCard from '../components/addItemCard';
import MaterialsSearch from '../components/materialsSearch';
import './CSS/labDetail.css';
import './CSS/Blob.css';

const LabDetailPage = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { fetchLabMaterials, loading, error } = useLab();
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const labNames = {
    'computer-lab': 'Computer Lab',
    'physics-lab': 'Physics Lab',
    'electronics-lab': 'Electronics Lab'
  };

  useEffect(() => {
    loadMaterials();
  }, [labId]);

  const loadMaterials = async () => {
    const data = await fetchLabMaterials(labId);
    if (data) {
      setMaterials(data);
      setFilteredMaterials(data);
    }
  };

  const handleAddMaterialSuccess = () => {
    loadMaterials();
  };

  const handleFilterChange = useCallback((filtered) => {
    setFilteredMaterials(filtered);
  }, []);

  const handleMaterialClick = (materialId) => {
    navigate(`/material/${materialId}`);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'in-stock';
  };

  return (
    <>
      <Header />
      <div className="page-wrapper lab-detail-container">
        {/* Animated Background */}
      <div className="animated-bg">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

        <div className="lab-detail-content">
          <div className="lab-header">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back to Labs
            </button>
            <h1 className="lab-title">{labNames[labId] || 'Lab'}</h1>
            <p className="lab-subtitle">Browse available materials and equipment</p>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading materials...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button onClick={loadMaterials} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && materials.length === 0 && (
            <div className="empty-state">
              <p>No materials found in this lab</p>
            </div>
          )}

          {!loading && !error && materials.length > 0 && (
            <>
              <MaterialsSearch 
                materials={materials}
                onFilter={handleFilterChange}
                labId={labId}
              />
              
              <div className="materials-grid">
                <AddItemCard 
                  onOpen={() => setShowAddModal(true)}
                  userRole={user?.role}
                />
                
                {filteredMaterials.map((material) => (
                  <div 
                    key={material._id || material.id}
                    className="material-card"
                    onClick={() => handleMaterialClick(material._id || material.id)}
                  >
                    <div className="material-image-wrapper">
                      {material.image ? (
                        <img src={material.image} alt={material.name} className="material-image" />
                      ) : (
                        <div className="material-placeholder">📦</div>
                      )}
                      <span className={`stock-badge ${getStockStatus(material.quantity)}`}>
                        {material.quantity > 0 ? `${material.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    
                    <div className="material-info">
                      <h3 className="material-name">{material.name}</h3>
                      <p className="material-description">
                        {material.description?.substring(0, 80)}
                        {material.description?.length > 80 ? '...' : ''}
                      </p>
                      
                      {material.category && (
                        <div className="material-category">
                          <span className="category-badge">{material.category}</span>
                        </div>
                      )}
                      
                      {material.tags && material.tags.length > 0 && (
                        <div className="material-tags">
                          {material.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="material-footer">
                      <button className="view-details-btn">View Details →</button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMaterials.length === 0 && (
                <div className="no-results">
                  <p>No materials match your filters</p>
                  <button 
                    onClick={() => setFilteredMaterials(materials)}
                    className="reset-btn"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {showAddModal && (
        <AddItemModal 
          labId={labId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddMaterialSuccess}
        />
      )}
      
      <Footer />
    </>
  );
};

export default LabDetailPage;
