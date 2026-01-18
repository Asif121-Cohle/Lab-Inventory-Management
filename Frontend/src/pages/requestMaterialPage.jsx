import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { requestAPI } from '../services/api';
import Header from './header';
import BackButton from '../components/BackButton';
import Footer from './footer';
import "./CSS/Blob.css";
import './CSS/requestMaterial.css';

const RequestMaterialPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchLabs, fetchLabMaterials } = useLab();

  const [labs, setLabs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLabs();
    // Pre-fill if coming from material detail page
    if (location.state?.materialId) {
      setSelectedMaterial(location.state.materialId);
    }
  }, []);

  useEffect(() => {
    if (selectedLab) {
      loadMaterials(selectedLab);
    } else {
      setMaterials([]);
      setSelectedMaterial('');
    }
  }, [selectedLab]);

  const loadLabs = async () => {
    const labsData = await fetchLabs();
    if (labsData) {
      setLabs(labsData);
    }
  };

  const loadMaterials = async (labId) => {
    const materialsData = await fetchLabMaterials(labId);
    if (materialsData) {
      setMaterials(materialsData.filter(m => m.quantity > 0)); // Only show available materials
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedLab || !selectedMaterial || quantity < 1) {
      setError('Please fill all required fields');
      return;
    }

    const selectedMaterialObj = materials.find(m => m._id === selectedMaterial || m.id === selectedMaterial);
    if (quantity > selectedMaterialObj?.quantity) {
      setError(`Only ${selectedMaterialObj.quantity} units available`);
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        labId: selectedLab,
        materialId: selectedMaterial,
        quantity: parseInt(quantity),
        purpose: purpose.trim()
      };

      await requestAPI.createRequest(requestData);
      setSuccess('Request submitted successfully! You can track it in Request Status.');
      
      // Reset form
      setTimeout(() => {
        navigate('/request-status');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const selectedMaterialObj = materials.find(m => m._id === selectedMaterial || m.id === selectedMaterial);

  return (
    <>
      <Header />
      <div className="page-wrapper request-material-container">
        {/*<div style={{maxWidth: '900px', margin: '0 auto 10px'}}>
          <BackButton />
        </div> */}
        {/* Animated Background */}
        <div className="animated-bg">
       <div className="blob"></div>
       <div className="blob"></div>
       <div className="blob"></div>
      </div>
        <div className="request-material-content">
          <div className="request-header">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back to Labs
            </button>
            <h1 className="request-title">Request Material</h1>
            <p className="request-subtitle">Submit a request for lab materials</p>
          </div>

          <form className="request-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="lab">Select Lab *</label>
              <select
                id="lab"
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">-- Choose a Lab --</option>
                {labs.map((lab) => (
                  <option key={lab._id || lab.id} value={lab._id || lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="material">Select Material *</label>
              <select
                id="material"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                required
                disabled={!selectedLab || loading}
              >
                <option value="">-- Choose a Material --</option>
                {materials.map((material) => (
                  <option key={material._id || material.id} value={material._id || material.id}>
                    {material.name} (Available: {material.quantity})
                  </option>
                ))}
              </select>
              {selectedLab && materials.length === 0 && (
                <small className="helper-text">No materials available in this lab</small>
              )}
            </div>

            {selectedMaterialObj && (
              <div className="material-preview">
                <h4>{selectedMaterialObj.name}</h4>
                <p>{selectedMaterialObj.description}</p>
                <p className="available-qty">Available: {selectedMaterialObj.quantity} units</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={selectedMaterialObj?.quantity || 999}
                required
                disabled={!selectedMaterial || loading}
              />
              {selectedMaterialObj && quantity > selectedMaterialObj.quantity && (
                <small className="error-text">Exceeds available quantity</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="purpose">Purpose (Optional)</label>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe why you need this material..."
                rows="4"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !selectedLab || !selectedMaterial}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>

          <div className="help-section">
            <p>💡 <strong>Tip:</strong> Your request will be reviewed by lab assistants. Check the Request Status page to track approval.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RequestMaterialPage;
