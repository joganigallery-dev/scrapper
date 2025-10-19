import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  loading 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <button
        className={`pagination-btn prev-btn ${currentPage === 1 || loading ? 'disabled' : ''}`}
        onClick={handlePrevious}
        disabled={currentPage === 1 || loading}
      >
        <ChevronLeft size={16} />
      </button>
      
      <div className="page-numbers">
        {pageNumbers.map(page => (
          <button
            key={page}
            className={`page-number ${page === currentPage ? 'active' : ''} ${loading ? 'disabled' : ''}`}
            onClick={() => handlePageClick(page)}
            disabled={loading}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        className={`pagination-btn next-btn ${currentPage === totalPages || loading ? 'disabled' : ''}`}
        onClick={handleNext}
        disabled={currentPage === totalPages || loading}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
