import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ count = 10, loadedCount = 0, totalCount = 0, message = '' }) => {
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;

  return (
    <div className="loading-skeleton-container">
      <div className="loading-header">
        <div className="loading-spinner-large">
          <div className="spinner-ring"></div>
          <div className="spinner-ring-2"></div>
        </div>
        <div className="loading-info">
          <h3 className="loading-title">{message || 'Loading Products'}</h3>
          <div className="loading-stats">
            <span className="loaded-count">{loadedCount}</span>
            {totalCount > 0 && (
              <>
                <span className="count-separator">/</span>
                <span className="total-count">{totalCount}</span>
              </>
            )}
            <span className="products-label">products loaded</span>
          </div>
          {totalCount > 0 && (
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-percentage">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="skeleton-table">
        <div className="skeleton-header">
          <div className="skeleton-cell skeleton-checkbox"></div>
          <div className="skeleton-cell skeleton-image"></div>
          <div className="skeleton-cell skeleton-title"></div>
          <div className="skeleton-cell skeleton-vendor"></div>
          <div className="skeleton-cell skeleton-price"></div>
          <div className="skeleton-cell skeleton-type"></div>
          <div className="skeleton-cell skeleton-action"></div>
        </div>

        {[...Array(count)].map((_, index) => (
          <div key={index} className="skeleton-row" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="skeleton-cell skeleton-checkbox">
              <div className="skeleton-box"></div>
            </div>
            <div className="skeleton-cell skeleton-image">
              <div className="skeleton-img"></div>
            </div>
            <div className="skeleton-cell skeleton-title">
              <div className="skeleton-text skeleton-text-long"></div>
              <div className="skeleton-text skeleton-text-short"></div>
            </div>
            <div className="skeleton-cell skeleton-vendor">
              <div className="skeleton-text skeleton-text-medium"></div>
            </div>
            <div className="skeleton-cell skeleton-price">
              <div className="skeleton-text skeleton-text-small"></div>
            </div>
            <div className="skeleton-cell skeleton-type">
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-cell skeleton-action">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
