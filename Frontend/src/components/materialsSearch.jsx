import React, { useState, useEffect } from 'react';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import './CSS/materialsSearch.css';

const MaterialsSearch = ({ materials, onFilter, categories = [] }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique tags from materials
  useEffect(() => {
    const tags = new Set();
    materials.forEach(material => {
      if (material.tags && Array.isArray(material.tags)) {
        material.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
  }, [materials]);

  // Apply filtering
  useEffect(() => {
    let filtered = materials;

    // Text search (name + description)
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(material =>
        (material.name && material.name.toLowerCase().includes(query)) ||
        (material.description && material.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(material => {
        if (!material.tags) return false;
        return selectedTags.some(tag => material.tags.includes(tag));
      });
    }

    onFilter(filtered);
  }, [searchText, selectedCategory, selectedTags, materials, onFilter]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedTags([]);
  };

  const activeFilters = Boolean(searchText || selectedCategory || selectedTags.length);

  return (
    <div className="materials-search-container">
      {/* Search Bar */}
      <div className="search-bar">
        <AiOutlineSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name, description..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        {searchText && (
          <button
            className="clear-btn"
            onClick={() => setSearchText('')}
            title="Clear search"
          >
            <AiOutlineClose />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <button
        className={`filter-toggle ${showFilters ? 'active' : ''} ${activeFilters ? 'has-active' : ''}`}
        onClick={() => setShowFilters(!showFilters)}
      >
        🔍 {activeFilters ? `Filters (${selectedTags.length + (selectedCategory ? 1 : 0)})` : 'Filters'}
      </button>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="filters-panel">
          {/* Category Filter */}
          <div className="filter-section">
            <h4>Category</h4>
            <div className="filter-options">
              <button
                className={`filter-option ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All
              </button>
              {['Equipment', 'Consumable', 'Chemical', 'Tool', 'Electronic Component', 'Other'].map(cat => (
                <button
                  key={cat}
                  className={`filter-option ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="filter-section">
              <h4>Tags</h4>
              <div className="filter-tags">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && <span className="tag-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {activeFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              ✕ Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters && (
        <div className="active-filters">
          {searchText && (
            <span className="filter-badge">
              Search: "{searchText}"
              <button onClick={() => setSearchText('')}>×</button>
            </span>
          )}
          {selectedCategory && (
            <span className="filter-badge">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('')}>×</button>
            </span>
          )}
          {selectedTags.map(tag => (
            <span key={tag} className="filter-badge">
              {tag}
              <button onClick={() => handleTagToggle(tag)}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsSearch;
