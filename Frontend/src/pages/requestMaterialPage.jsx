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

  // AI Assistant state
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

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

  // AI Assistant functions
  const handleAiSuggest = async () => {
    if (!projectDescription.trim() || projectDescription.trim().length < 10) {
      setError('Please describe your project in detail (at least 10 characters)');
      return;
    }

    setAiLoading(true);
    setError('');
    setAiSuggestions([]);

    try {
      const { data } = await requestAPI.aiSuggestMaterials(projectDescription, selectedLab);

      if (data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
        setSuccess(`🤖 Found ${data.suggestions.length} materials for your project!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('No matching materials found. Try describing your project differently.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI suggestion failed. Try manual selection.');
      console.error('AI suggest error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSuggestion = (suggestion) => {
    const exists = selectedSuggestions.find(s => s.materialId === suggestion.materialId);
    if (exists) {
      setSelectedSuggestions(selectedSuggestions.filter(s => s.materialId !== suggestion.materialId));
    } else {
      setSelectedSuggestions([...selectedSuggestions, suggestion]);
    }
  };

  const handleBulkRequest = async () => {
    if (selectedSuggestions.length === 0) {
      setError('Please select at least one material');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let successCount = 0;
      const errors = [];

      for (const suggestion of selectedSuggestions) {
        try {
          await requestAPI.createRequest({
            labId: suggestion.lab._id || suggestion.lab.id,
            materialId: suggestion.materialId,
            quantity: suggestion.quantity,
            purpose: `AI suggested for: ${projectDescription.substring(0, 50)}...`
          });
          successCount++;
        } catch (err) {
          errors.push(`${suggestion.name}: ${err.response?.data?.message || 'Failed'}`);
        }
      }

      if (successCount > 0) {
        setSuccess(`✅ Successfully requested ${successCount} material(s)!`);
        setTimeout(() => navigate('/request-status'), 2000);
      }

      if (errors.length > 0) {
        setError(`Some requests failed:\n${errors.join('\n')}`);
      }
    } catch (err) {
      setError('Failed to submit requests');
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

            {/* AI Assistant Toggle */}
            <div className="ai-toggle-container">
              <button
                className={`ai-toggle-btn ${showAiAssistant ? 'active' : ''}`}
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                type="button"
              >
                {showAiAssistant ? '📋 Manual Selection' : '🤖 AI Assistant'}
              </button>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* AI Assistant Mode */}
          {showAiAssistant ? (
            <div className="ai-assistant-container">
              <div className="ai-header">
                <h3>🤖 Smart Material Assistant</h3>
                <p>Describe your project and I'll suggest the materials you need!</p>
              </div>

              <div className="form-group">
                <label htmlFor="projectDescription">What are you building? *</label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Example: I need to build a temperature monitoring system using Arduino that displays data on LCD..."
                  rows="5"
                  disabled={aiLoading}
                  className="ai-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="aiLabSelect">Prefer specific lab? (Optional)</label>
                <select
                  id="aiLabSelect"
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  disabled={aiLoading}
                >
                  <option value="">-- Any Lab --</option>
                  {labs.map((lab) => (
                    <option key={lab._id || lab.id} value={lab._id || lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn-ai-suggest"
                onClick={handleAiSuggest}
                disabled={aiLoading || !projectDescription.trim()}
                type="button"
              >
                {aiLoading ? '🤖 Analyzing...' : '✨ Get AI Suggestions'}
              </button>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="ai-suggestions">
                  <h4>Suggested Materials:</h4>
                  <div className="suggestions-list">
                    {aiSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.materialId}
                        className={`suggestion-card ${selectedSuggestions.find(s => s.materialId === suggestion.materialId) ? 'selected' : ''}`}
                        onClick={() => toggleSuggestion(suggestion)}
                      >
                        <div className="suggestion-checkbox">
                          <input
                            type="checkbox"
                            checked={!!selectedSuggestions.find(s => s.materialId === suggestion.materialId)}
                            onChange={() => { }}
                          />
                        </div>
                        <div className="suggestion-content">
                          <h5>{suggestion.name}</h5>
                          <p className="suggestion-reason">💡 {suggestion.reason}</p>
                          <div className="suggestion-meta">
                            <span className="badge">{suggestion.category}</span>
                            <span className="quantity">Qty: {suggestion.quantity}</span>
                            <span className="available">Available: {suggestion.available}</span>
                            <span className="lab-badge">{suggestion.lab.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setAiSuggestions([]);
                        setSelectedSuggestions([]);
                        setProjectDescription('');
                      }}
                      disabled={loading}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleBulkRequest}
                      disabled={loading || selectedSuggestions.length === 0}
                    >
                      {loading ? 'Submitting...' : `Request Selected (${selectedSuggestions.length})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual Selection Mode (Original Form) */
            <>
              <form className="request-form" onSubmit={handleSubmit}>

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
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RequestMaterialPage;
