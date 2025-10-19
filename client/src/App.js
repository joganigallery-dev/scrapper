import React, { useState } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ResultsSection from './components/ResultsSection';
import LoadingSkeleton from './components/LoadingSkeleton';
import './App.css';

function App() {
  const [searchData, setSearchData] = useState({
    url: '',
    type: 'products'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [loadedCount, setLoadedCount] = useState(0);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setLoadingProgress('Starting to scrape store...');
    setLoadedCount(0);
    
    try {
      // NO LIMITS - scrape everything
      const limit = 999999;
      
      const response = await fetch('/api/scraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchParams.url,
          type: searchParams.type,
          page: 1,
          limit: limit
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape store');
      }

      const itemType = searchParams.type === 'products' ? 'products' : 'collections';
      const itemCount = data.data[itemType]?.length || 0;
      setLoadedCount(itemCount);

      setResults(data.data);
      setTotalItems(data.data.total);
      setSearchData(searchParams);

      // Auto-export if export type is specified
      if (searchParams.exportType === 'free' || searchParams.exportType === 'all') {
        setLoadingProgress('Exporting data...');
        setTimeout(() => {
          handleExport('csv');
          setLoadingProgress('');
        }, 1000);
      }
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
      setLoadingProgress('');
    }
  };

  const handlePageChange = async (page) => {
    if (!searchData.url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchData.url,
          type: searchData.type,
          page: page,
          limit: 999999
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape store');
      }

      setResults(data.data);
      setTotalItems(data.data.total);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchData({ url: '', type: 'products' });
    setResults(null);
    setError(null);
    setCurrentPage(1);
    setTotalItems(0);
  };

  const handleExport = (format = 'csv', specificItems = null) => {
    if (!results) return;

    let dataToExport = [];
    let filename = '';

    if (specificItems) {
      // Export specific items (single product/collection)
      dataToExport = specificItems;
      const itemType = searchData.type === 'products' ? 'product' : 'collection';
      filename = `shopify-${itemType}-${specificItems[0].title?.replace(/[^a-zA-Z0-9]/g, '-') || 'item'}-${Date.now()}.${format}`;
    } else {
      // Export all items
      if (searchData.type === 'products') {
        dataToExport = results.products || [];
        filename = `shopify-all-products-${Date.now()}.${format}`;
      } else {
        dataToExport = results.collections || [];
        filename = `shopify-all-collections-${Date.now()}.${format}`;
      }
    }

    if (format === 'csv') {
      exportToCSV(dataToExport, filename);
    } else if (format === 'json') {
      exportToJSON(dataToExport, filename);
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;

    if (searchData.type === 'products') {
      exportProductsToShopifyCSV(data, filename);
    } else {
      exportCollectionsToCSV(data, filename);
    }
  };

  const exportProductsToShopifyCSV = (products, filename) => {
    // Exact Shopify CSV format headers (47 columns) - matching original file
    const headers = [
      'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
      'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
      'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Policy',
      'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
      'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode',
      'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
      'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category',
      'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN',
      'Google Shopping / AdWords Grouping', 'Google Shopping / AdWords Labels',
      'Google Shopping / Condition', 'Google Shopping / Custom Product',
      'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1',
      'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3',
      'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit',
      'Variant Tax Code', 'Cost per item', 'Status'
    ];

    const csvRows = [];
    
    products.forEach(product => {
      const hasVariants = product.variants && product.variants.length > 0;
      
      if (hasVariants) {
        // Use actual variants from the product
        product.variants.forEach((variant, index) => {
          const isFirstVariant = index === 0;
          
          csvRows.push([
            product.handle || product.id,                                                          // Handle
            isFirstVariant ? product.title : '',                                                   // Title
            isFirstVariant ? product.description : '',                                             // Body (HTML)
            isFirstVariant ? product.vendor : '',                                                  // Vendor
            isFirstVariant ? product.product_type : '',                                            // Type
            isFirstVariant ? (product.tags ? product.tags.join(',') : '') : '',                    // Tags
            isFirstVariant ? product.published_at : '',                                            // Published
            variant.option1_name || '',                                                            // Option1 Name
            variant.option1 || '',                                                                 // Option1 Value
            variant.option2_name || '',                                                            // Option2 Name
            variant.option2 || '',                                                                 // Option2 Value
            variant.option3_name || '',                                                            // Option3 Name
            variant.option3 || '',                                                                 // Option3 Value
            variant.sku || '',                                                                     // Variant SKU
            variant.weight || '0',                                                                 // Variant Grams
            '',                                                                                    // Variant Inventory Tracker
            'deny',                                                                                // Variant Inventory Policy
            'manual',                                                                              // Variant Fulfillment Service
            variant.price || product.price || '0',                                                 // Variant Price
            variant.compare_at_price || product.compare_at_price || '',                           // Variant Compare At Price
            'true',                                                                                // Variant Requires Shipping
            'true',                                                                                // Variant Taxable
            variant.barcode || '',                                                                 // Variant Barcode
            isFirstVariant ? (product.images && product.images[0] ? product.images[0].src : '') : '', // Image Src
            isFirstVariant ? '1' : '',                                                             // Image Position
            isFirstVariant ? (product.images && product.images[0] ? product.images[0].alt : '') : '', // Image Alt Text
            'false',                                                                               // Gift Card
            '',                                                                                    // SEO Title
            '',                                                                                    // SEO Description
            '',                                                                                    // Google Shopping / Google Product Category
            '',                                                                                    // Google Shopping / Gender
            '',                                                                                    // Google Shopping / Age Group
            '',                                                                                    // Google Shopping / MPN
            '',                                                                                    // Google Shopping / AdWords Grouping
            '',                                                                                    // Google Shopping / AdWords Labels
            '',                                                                                    // Google Shopping / Condition
            '',                                                                                    // Google Shopping / Custom Product
            '',                                                                                    // Google Shopping / Custom Label 0
            '',                                                                                    // Google Shopping / Custom Label 1
            '',                                                                                    // Google Shopping / Custom Label 2
            '',                                                                                    // Google Shopping / Custom Label 3
            '',                                                                                    // Google Shopping / Custom Label 4
            variant.image || (product.images && product.images[0] ? product.images[0].src : ''),  // Variant Image
            '',                                                                                    // Variant Weight Unit
            '',                                                                                    // Variant Tax Code
            '',                                                                                    // Cost per item
            'active'                                                                               // Status
          ]);
        });
      } else {
        // Product without variants - only ONE row
        csvRows.push([
          product.handle || product.id,                                                            // Handle
          product.title,                                                                           // Title
          product.description,                                                                     // Body (HTML)
          product.vendor,                                                                          // Vendor
          product.product_type,                                                                    // Type
          product.tags ? product.tags.join(',') : '',                                              // Tags
          product.published_at,                                                                    // Published
          '',                                                                                      // Option1 Name
          '',                                                                                      // Option1 Value
          '',                                                                                      // Option2 Name
          '',                                                                                      // Option2 Value
          '',                                                                                      // Option3 Name
          '',                                                                                      // Option3 Value
          '',                                                                                      // Variant SKU
          '0',                                                                                     // Variant Grams
          '',                                                                                      // Variant Inventory Tracker
          'deny',                                                                                  // Variant Inventory Policy
          'manual',                                                                                // Variant Fulfillment Service
          product.price || '0',                                                                    // Variant Price
          product.compare_at_price || '',                                                          // Variant Compare At Price
          'true',                                                                                  // Variant Requires Shipping
          'true',                                                                                  // Variant Taxable
          '',                                                                                      // Variant Barcode
          product.images && product.images[0] ? product.images[0].src : '',                       // Image Src
          '1',                                                                                     // Image Position
          product.images && product.images[0] ? product.images[0].alt : '',                       // Image Alt Text
          'false',                                                                                 // Gift Card
          '',                                                                                      // SEO Title
          '',                                                                                      // SEO Description
          '',                                                                                      // Google Shopping / Google Product Category
          '',                                                                                      // Google Shopping / Gender
          '',                                                                                      // Google Shopping / Age Group
          '',                                                                                      // Google Shopping / MPN
          '',                                                                                      // Google Shopping / AdWords Grouping
          '',                                                                                      // Google Shopping / AdWords Labels
          '',                                                                                      // Google Shopping / Condition
          '',                                                                                      // Google Shopping / Custom Product
          '',                                                                                      // Google Shopping / Custom Label 0
          '',                                                                                      // Google Shopping / Custom Label 1
          '',                                                                                      // Google Shopping / Custom Label 2
          '',                                                                                      // Google Shopping / Custom Label 3
          '',                                                                                      // Google Shopping / Custom Label 4
          product.images && product.images[0] ? product.images[0].src : '',                       // Variant Image
          '',                                                                                      // Variant Weight Unit
          '',                                                                                      // Variant Tax Code
          '',                                                                                      // Cost per item
          'active'                                                                                 // Status
        ]);
      }
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        row.map(cell => {
          const value = String(cell || '');
          return `"${value.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCollectionsToCSV = (collections, filename) => {
    const headers = Object.keys(collections[0]);
    const csvContent = [
      headers.join(','),
      ...collections.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <SearchSection 
          onSearch={handleSearch}
          onClear={handleClear}
          loading={loading}
          loadingProgress={loadingProgress}
          searchData={searchData}
        />
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading && !results && (
          <div className="container" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
            <LoadingSkeleton
              count={10}
              loadedCount={loadedCount}
              totalCount={totalItems}
              message={loadingProgress}
            />
          </div>
        )}

        {results && (
          <ResultsSection
            results={results}
            searchType={searchData.type}
            loading={loading}
            loadingProgress={loadingProgress}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onExport={handleExport}
          />
        )}
      </main>
    </div>
  );
}

export default App;
