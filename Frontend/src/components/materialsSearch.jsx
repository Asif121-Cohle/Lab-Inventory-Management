import React, { useState, useEffect, useCallback } from 'react';
import { AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import { materialAPI } from '../services/api';
import './CSS/materialsSearch.css';

const MaterialsSearch = ({ materials, onFilter, categories = [], labId }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // AI Search state
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIntent, setAiIntent] = useState('');

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
    // If AI mode is active, don't use local filtering at all
    if (aiMode) {
      return;
    }

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
  }, [searchText, selectedCategory, selectedTags, materials, onFilter, aiMode]);

  // AI Search with debounce
  const handleAiSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      onFilter(materials);
      setAiIntent('');
      return;
    }

    setAiLoading(true);
    setAiIntent('');

    try {
      const { data } = await materialAPI.aiSearchMaterials(query, labId);
      
      onFilter(data.materials);
      
      if (data.aiPowered && data.intent) {
        setAiIntent(data.intent);
      }

      // Apply suggested filters if available
      if (data.filters?.categories?.length > 0) {
        setSelectedCategory(data.filters.categories[0]);
      }
      if (data.filters?.tags?.length > 0) {
        setSelectedTags(data.filters.tags.slice(0, 3));
      }

    } catch (error) {
      console.error('AI search failed:', error);
      // Fallback to local search
      const query = searchText.toLowerCase();
      const filtered = materials.filter(material =>
        (material.name && material.name.toLowerCase().includes(query)) ||
        (material.description && material.description.toLowerCase().includes(query))
      );
      onFilter(filtered);
    } finally {
      setAiLoading(false);
    }
  }, [materials, onFilter, labId, searchText]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setAiIntent('');
  };

  const handleSearchSubmit = () => {
    if (aiMode && searchText.trim().length >= 3) {
      handleAiSearch(searchText);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const toggleAiMode = () => {
    setAiMode(!aiMode);
    setAiIntent('');
    if (aiMode) {
      // Switching back to manual mode - reset to all materials
      onFilter(materials);
    }
  };

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
      {/* AI Mode Toggle */}
      <div className="ai-mode-toggle-container">
        <button
          className={`ai-mode-btn ${aiMode ? 'active' : ''}`}
          onClick={toggleAiMode}
          title={aiMode ? 'Switch to manual search' : 'Switch to AI search'}
        >
          {aiMode ? '✨ AI Search' : '🔍 Manual Search'}
        </button>
      </div>

      {/* Search Bar */}
      <div className={`search-bar ${aiMode ? 'ai-mode' : ''} ${aiLoading ? 'loading' : ''}`}>
        <AiOutlineSearch className="search-icon" />
        <input
          type="text"
          placeholder={aiMode 
            ? 'Ask me anything: "Show Arduino components" or "capacitors above 100μF"... (Press Enter or click search)' 
            : 'Search by name, description...'
          }
          value={searchText}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        {aiMode && searchText.trim().length >= 3 && !aiLoading && (
          <button
            className="search-submit-btn"
            onClick={handleSearchSubmit}
            title="Search with AI"
          >
            <AiOutlineSearch />
          </button>
        )}
        {aiLoading && <div className="search-spinner"></div>}
        {searchText && !aiLoading && (
          <button
            className="clear-btn"
            onClick={() => {
              setSearchText('');
              setAiIntent('');
              onFilter(materials);
            }}
            title="Clear search"
          >
            <AiOutlineClose />
          </button>
        )}
      </div>

      {/* AI Intent Display */}
      {aiMode && aiIntent && (
        <div className="ai-intent-badge">
          💡 {aiIntent}
        </div>
      )}

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
