import React from 'react';
import { Download, Percent, Eye } from 'lucide-react';
import './Table.css';

const ProductsTable = ({ 
  products, 
  loading, 
  selectedItems, 
  onSelectAll, 
  onSelectItem, 
  onExport 
}) => {
  const allSelected = products.length > 0 && selectedItems.length === products.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < products.length;

  const handleSelectAllChange = (e) => {
    onSelectAll(e.target.checked);
  };

  const handleItemSelect = (productId, e) => {
    onSelectItem(productId, e.target.checked);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="table-empty">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th className="checkbox-col">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={handleSelectAllChange}
                className="checkbox"
              />
            </th>
            <th>Image</th>
            <th>Title</th>
            <th>Vendor</th>
            <th>Price</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id || index}>
              <td className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(product.id)}
                  onChange={(e) => handleItemSelect(product.id, e)}
                  className="checkbox"
                />
              </td>
              <td className="image-col">
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].src || product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgxNlYyNEgxNlYxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDE2SDI0VjI0SDI0VjE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      <Eye size={16} />
                    </div>
                  )}
                </div>
              </td>
              <td className="title-col">
                <div className="product-title">
                  <h4>{product.title}</h4>
                  {product.description && (
                    <p className="product-description">
                      {product.description.substring(0, 100)}
                      {product.description.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              </td>
              <td className="vendor-col">
                <span className="vendor">{product.vendor}</span>
              </td>
              <td className="price-col">
                <div className="price-info">
                  <span className="price">${product.price || '0'}</span>
                  {product.compare_at_price && product.compare_at_price !== product.price && (
                    <span className="compare-price">${product.compare_at_price}</span>
                  )}
                </div>
              </td>
              <td className="type-col">
                <span className="product-type">{product.product_type || 'N/A'}</span>
              </td>
              <td className="actions-col">
                <div className="action-buttons">
                  <button 
                    className="action-btn"
                    title="View Details"
                    onClick={() => window.open(product.url, '_blank')}
                  >
                    <Percent size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    title="Export"
                    onClick={() => onExport('csv', [product])}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
