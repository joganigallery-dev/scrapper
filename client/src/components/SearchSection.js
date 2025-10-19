import React, { useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import './SearchSection.css';

const SearchSection = ({ onSearch, onClear, loading, loadingProgress, searchData }) => {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('products');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    onSearch({ url: url.trim(), type });
  };

  const handleClear = () => {
    setUrl('');
    setType('products');
    onClear();
  };

  return (
    <section className="search-section">
      <div className="container">
        <div className="search-content">
          <h1 className="search-title">
            <span className="title-highlight">Shopify Scraper</span> Search
          </h1>
          <p className="search-description">
            Need to export products from a Shopify site? Let Shopify Scraper guide you. 
            Simply type in the domain of a Shopify store.
          </p>
          
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-inputs">
              <div className="url-input-container">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example-store.myshopify.com"
                  className="url-input"
                  required
                />
              </div>
              
              <div className="type-selector">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="type-select"
                >
                  <option value="products">PRODUCTS</option>
                  <option value="collections">COLLECTIONS</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="search-btn"
                disabled={loading || !url.trim()}
              >
                {loading ? (
                  <div className="loading-spinner-small"></div>
                ) : (
                  <Search size={20} />
                )}
              </button>
            </div>
            
            <div className="action-buttons">
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleClear}
              >
                <Eye size={16} />
                CLEAR
              </button>
              
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => onSearch({ url, type, exportType: 'free' })}
                disabled={loading || !url.trim()}
              >
                <Download size={16} />
                FREE EXPORT
              </button>
              
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => onSearch({ url, type, exportType: 'all' })}
                disabled={loading || !url.trim()}
              >
                <Download size={16} />
                EXPORT ALL
              </button>
            </div>
          </form>
          
          {loading && loadingProgress && (
            <div className="loading-message">
              <div className="loading-spinner-small"></div>
              <p>{loadingProgress}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
