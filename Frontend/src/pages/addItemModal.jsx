import React, { useState } from 'react';
import { materialAPI } from '../services/api';
import './CSS/addItemModal.css';

const AddItemModal = ({ labId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    imageLink: '',
    category: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const categorizeWithAI = async () => {
    if (!formData.name.trim()) {
      setError('Please enter an item name first');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      // Call backend API to use Gemini for categorization
      const response = await fetch('http://localhost:5000/api/materials/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to categorize item');
      }

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : ''
      }));

      setAiSuggested(true);
      setSuccess('✅ AI categorization applied! (editable)');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`AI categorization failed: ${err.message}`);
      console.error('Categorization error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.quantity || !formData.category) {
      setError('Please fill in all required fields (name, quantity, category)');
      return;
    }

    setLoading(true);

    try {
      const materialData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        minThreshold: Math.ceil(parseInt(formData.quantity) * 0.2), // 20% of quantity
        category: formData.category,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        image: formData.imageLink.trim() || null,
        labId: labId
      };

      await materialAPI.addMaterial(materialData);
      
      setSuccess('✅ Item added successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
      console.error('Add item error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Add New Material</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Item Name */}
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., 9V Alkaline Battery"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the item..."
              rows="3"
              disabled={loading}
            />
          </div>

          {/* AI Categorization Button */}
          <div className="ai-section">
            <button
              type="button"
              className="ai-btn"
              onClick={categorizeWithAI}
              disabled={aiLoading || loading || !formData.name.trim()}
            >
              {aiLoading ? '🤖 Analyzing...' : '🤖 AI Smart Categorization'}
            </button>
            {aiSuggested && <span className="ai-badge">AI Applied</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="">-- Select Category --</option>
              <option value="Equipment">Equipment</option>
              <option value="Consumable">Consumable</option>
              <option value="Chemical">Chemical</option>
              <option value="Tool">Tool</option>
              <option value="Electronic Component">Electronic Component</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., battery, power, 9V"
              disabled={loading}
            />
            <small className="helper-text">AI suggestions are editable before save</small>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label htmlFor="quantity">Total Amount to Order *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              placeholder="e.g., 50"
              required
              disabled={loading}
            />
          </div>

          {/* Image Link */}
          <div className="form-group">
            <label htmlFor="imageLink">Image Link (Optional)</label>
            <input
              type="url"
              id="imageLink"
              name="imageLink"
              value={formData.imageLink}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
            {formData.imageLink && (
              <img src={formData.imageLink} alt="Preview" className="image-preview" />
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || aiLoading}
            >
              {loading ? 'Adding...' : '✓ Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
