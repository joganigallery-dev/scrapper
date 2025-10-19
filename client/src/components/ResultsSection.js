import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import ProductsTable from './ProductsTable';
import CollectionsTable from './CollectionsTable';
import Pagination from './Pagination';
import './ResultsSection.css';

const ResultsSection = ({ 
  results, 
  searchType, 
  loading, 
  loadingProgress,
  currentPage, 
  totalItems, 
  onPageChange, 
  onExport 
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const filteredData = () => {
    if (!results) return [];
    
    const data = searchType === 'products' ? results.products : results.collections;
    if (!data) return [];
    
    if (!searchFilter.trim()) return data;
    
    const filter = searchFilter.toLowerCase();
    return data.filter(item => 
      item.title.toLowerCase().includes(filter) ||
      (item.vendor && item.vendor.toLowerCase().includes(filter)) ||
      (item.description && item.description.toLowerCase().includes(filter))
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredData().map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleExportSelected = () => {
    if (selectedItems.length === 0) return;
    
    const data = searchType === 'products' ? results.products : results.collections;
    const selectedData = data.filter(item => selectedItems.includes(item.id));
    
    onExport('csv', selectedData);
  };

  const itemType = searchType === 'products' ? 'PRODUCTS' : 'COLLECTIONS';

  return (
    <section className="results-section">
      <div className="container">
        <div className="results-header">
          <div className="results-info">
            <h2 className="results-title">
              TOTAL {itemType} {totalItems}
            </h2>
          </div>
          
          <div className="results-actions">
            <div className="export-dropdown">
              <select className="export-select" onChange={(e) => {
                if (e.target.value === 'shopify') {
                  onExport('csv');
                } else if (e.target.value === 'json') {
                  onExport('json');
                }
                e.target.value = 'shopify'; // Reset to default
              }}>
                <option value="shopify">Export to: Shopify</option>
                <option value="json">Export to: JSON</option>
              </select>
            </div>
            
            <div className="search-filter">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="search"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={999999}
          onPageChange={onPageChange}
          loading={loading}
        />

        <div className="table-container">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>{loadingProgress || 'Loading...'}</p>
              </div>
            </div>
          )}
          
          {searchType === 'products' ? (
            <ProductsTable
              products={filteredData()}
              loading={loading}
              selectedItems={selectedItems}
              onSelectAll={handleSelectAll}
              onSelectItem={handleSelectItem}
              onExport={onExport}
            />
          ) : (
            <CollectionsTable
              collections={filteredData()}
              loading={loading}
              selectedItems={selectedItems}
              onSelectAll={handleSelectAll}
              onSelectItem={handleSelectItem}
              onExport={onExport}
            />
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="selected-actions">
            <p>{selectedItems.length} items selected</p>
            <button 
              className="btn btn-primary btn-small"
              onClick={handleExportSelected}
            >
              <Download size={16} />
              Export Selected
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResultsSection;
