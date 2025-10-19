import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import './FilterPanel.css';

const FilterPanel = ({ products, onFilterChange, onExportFiltered }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    vendors: [],
    tags: [],
    collections: [],
    priceRange: { min: '', max: '' },
    searchTitle: ''
  });

  const [availableFilters, setAvailableFilters] = useState({
    vendors: [],
    tags: [],
    collections: [],
    priceRange: { min: 0, max: 1000 }
  });

  const [expandedSections, setExpandedSections] = useState({
    vendors: true,
    tags: false,
    collections: false,
    price: false
  });

  useEffect(() => {
    if (products && products.length > 0) {
      const vendors = [...new Set(products.map(p => p.vendor).filter(Boolean))];
      const tags = [...new Set(products.flatMap(p => p.tags || []))];
      const collections = [...new Set(products.flatMap(p => p.collections || []).map(c => c.title || c).filter(Boolean))];

      const prices = products.map(p => parseFloat(p.price) || 0).filter(p => p > 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      setAvailableFilters({
        vendors: vendors.sort(),
        tags: tags.sort(),
        collections: collections.sort(),
        priceRange: { min: minPrice, max: maxPrice }
      });
    }
  }, [products]);

  const handleFilterChange = (filterType, value, isChecked) => {
    let newFilters = { ...filters };

    if (filterType === 'vendors' || filterType === 'tags' || filterType === 'collections') {
      if (isChecked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
      }
    } else if (filterType === 'priceMin' || filterType === 'priceMax') {
      const key = filterType === 'priceMin' ? 'min' : 'max';
      newFilters.priceRange[key] = value;
    } else if (filterType === 'searchTitle') {
      newFilters.searchTitle = value;
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      vendors: [],
      tags: [],
      collections: [],
      priceRange: { min: '', max: '' },
      searchTitle: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters =
    filters.vendors.length > 0 ||
    filters.tags.length > 0 ||
    filters.collections.length > 0 ||
    filters.priceRange.min !== '' ||
    filters.priceRange.max !== '' ||
    filters.searchTitle !== '';

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`filter-panel ${isOpen ? 'open' : ''}`}>
      <button className="filter-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Filter size={18} />
        <span>Filters</span>
        {hasActiveFilters && <span className="filter-badge">{
          filters.vendors.length +
          filters.tags.length +
          filters.collections.length +
          (filters.priceRange.min || filters.priceRange.max ? 1 : 0) +
          (filters.searchTitle ? 1 : 0)
        }</span>}
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="filter-content">
          <div className="filter-header">
            <h3>Filter Products</h3>
            {hasActiveFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          <div className="filter-section">
            <label className="filter-label">Search by Title</label>
            <input
              type="text"
              className="filter-search-input"
              placeholder="Type to search..."
              value={filters.searchTitle}
              onChange={(e) => handleFilterChange('searchTitle', e.target.value)}
            />
          </div>

          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleSection('price')}
            >
              <span>Price Range</span>
              {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSections.price && (
              <div className="filter-section-content">
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="price-input"
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="price-input"
                  />
                </div>
                <div className="price-hint">
                  Range: ${availableFilters.priceRange.min.toFixed(2)} - ${availableFilters.priceRange.max.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {availableFilters.vendors.length > 0 && (
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('vendors')}
              >
                <span>Vendors ({availableFilters.vendors.length})</span>
                {expandedSections.vendors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.vendors && (
                <div className="filter-section-content">
                  <div className="filter-options">
                    {availableFilters.vendors.map(vendor => (
                      <label key={vendor} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters.vendors.includes(vendor)}
                          onChange={(e) => handleFilterChange('vendors', vendor, e.target.checked)}
                        />
                        <span>{vendor}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {availableFilters.tags.length > 0 && (
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('tags')}
              >
                <span>Tags ({availableFilters.tags.length})</span>
                {expandedSections.tags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.tags && (
                <div className="filter-section-content">
                  <div className="filter-options">
                    {availableFilters.tags.slice(0, 20).map(tag => (
                      <label key={tag} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={(e) => handleFilterChange('tags', tag, e.target.checked)}
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                    {availableFilters.tags.length > 20 && (
                      <p className="filter-hint">Showing first 20 tags</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {availableFilters.collections.length > 0 && (
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('collections')}
              >
                <span>Collections ({availableFilters.collections.length})</span>
                {expandedSections.collections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.collections && (
                <div className="filter-section-content">
                  <div className="filter-options">
                    {availableFilters.collections.map(collection => (
                      <label key={collection} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters.collections.includes(collection)}
                          onChange={(e) => handleFilterChange('collections', collection, e.target.checked)}
                        />
                        <span>{collection}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <div className="filter-actions">
              <button className="export-filtered-btn" onClick={onExportFiltered}>
                Export Filtered Products
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
