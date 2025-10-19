import React from 'react';
import { Search, Star } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon">
            <Search size={24} />
          </div>
          <span className="logo-text">Shopify Scraper</span>
        </div>
        
        <nav className="nav">
          <a href="#try" className="nav-link new-badge">
            TRY IT NOW
            <span className="badge">NEW</span>
          </a>
          <a href="#features" className="nav-link">FEATURES</a>
          <a href="#pricing" className="nav-link">PRICING</a>
          <a href="#how-it-works" className="nav-link">HOW IT WORKS?</a>
        </nav>
        
        <div className="header-actions">
          <a href="#signin" className="nav-link">SIGN IN</a>
          <button className="upgrade-btn">
            <Star size={16} />
            UPGRADE NOW
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
