import React from 'react';
import { Download, Link, Eye } from 'lucide-react';
import './Table.css';

const CollectionsTable = ({ 
  collections, 
  loading, 
  selectedItems, 
  onSelectAll, 
  onSelectItem, 
  onExport 
}) => {
  const allSelected = collections.length > 0 && selectedItems.length === collections.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < collections.length;

  const handleSelectAllChange = (e) => {
    onSelectAll(e.target.checked);
  };

  const handleItemSelect = (collectionId, e) => {
    onSelectItem(collectionId, e.target.checked);
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading"></div>
        <p>Loading collections...</p>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="table-empty">
        <p>No collections found</p>
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
            <th>Title</th>
            <th>Description</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection, index) => (
            <tr key={collection.id || index}>
              <td className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(collection.id)}
                  onChange={(e) => handleItemSelect(collection.id, e)}
                  className="checkbox"
                />
              </td>
              <td className="title-col">
                <div className="collection-title">
                  <h4>{collection.title}</h4>
                </div>
              </td>
              <td className="description-col">
                <div className="collection-description">
                  {collection.description ? (
                    <p>{collection.description.substring(0, 150)}</p>
                  ) : (
                    <span className="no-description">No description</span>
                  )}
                </div>
              </td>
              <td className="total-col">
                <span className="products-count">{collection.products_count || 0}</span>
              </td>
              <td className="actions-col">
                <div className="action-buttons">
                  <button 
                    className="action-btn"
                    title="View Collection"
                    onClick={() => window.open(collection.url, '_blank')}
                  >
                    <Link size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    title="View Products"
                    onClick={() => {
                      // This would typically navigate to view products in this collection
                      console.log('View products in collection:', collection.title);
                    }}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    title="Export"
                    onClick={() => onExport('csv', [collection])}
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

export default CollectionsTable;
