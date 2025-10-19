const express = require('express');
const router = express.Router();
const { scrapeShopifyStore } = require('../services/shopifyScraper');

// POST /api/scraper/scrape
router.post('/scrape', async (req, res) => {
  try {
    const { url, type = 'products', page = 1, limit = 999999 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let shopifyUrl;
    try {
      const urlObj = new URL(url);
      shopifyUrl = urlObj.origin;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Scraping ${type} from: ${shopifyUrl}`);
    
    const results = await scrapeShopifyStore(shopifyUrl, type, page, limit);
    
    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: results.total,
        hasMore: results.hasMore
      }
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape store',
      message: error.message 
    });
  }
});

// GET /api/scraper/collections/:storeId
router.get('/collections/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 999999 } = req.query;
    
    // Reconstruct URL from storeId
    const url = `https://${storeId}.myshopify.com`;
    
    const results = await scrapeShopifyStore(url, 'collections', page, limit);
    
    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.total,
        hasMore: results.hasMore
      }
    });
  } catch (error) {
    console.error('Collections scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape collections',
      message: error.message 
    });
  }
});

// GET /api/scraper/products/:storeId
router.get('/products/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 999999 } = req.query;
    
    // Reconstruct URL from storeId
    const url = `https://${storeId}.myshopify.com`;
    
    const results = await scrapeShopifyStore(url, 'products', page, limit);
    
    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.total,
        hasMore: results.hasMore
      }
    });
  } catch (error) {
    console.error('Products scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape products',
      message: error.message 
    });
  }
});

module.exports = router;
