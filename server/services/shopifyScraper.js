const axios = require('axios');
const cheerio = require('cheerio');

class ShopifyScraper {
  constructor() {
    this.baseHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };
  }

  async scrapeShopifyStore(url, type = 'products', page = 1, limit = 50) {
    try {
      const storeUrl = this.normalizeUrl(url);
      
      if (type === 'products') {
        return await this.scrapeProducts(storeUrl, page, limit);
      } else if (type === 'collections') {
        return await this.scrapeCollections(storeUrl, page, limit);
      } else {
        throw new Error('Invalid type. Use "products" or "collections"');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  }

  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  async scrapeProducts(storeUrl, page = 1, limit = 999999) {
    try {
      const products = [];
      let totalProducts = 0;
      let hasMore = false;

      // First, fetch all collections to map products to collections
      const collectionsMap = await this.fetchCollectionsWithProducts(storeUrl);

      // Try different approaches to get products
      let productData = null;
      
      // First try: Basic products endpoint
      try {
        const response = await axios.get(`${storeUrl}/products.json`, {
          headers: this.baseHeaders,
          timeout: 10000
        });
        
        if (response.data && response.data.products) {
          productData = response.data.products;
          console.log(`Found ${productData.length} products via basic endpoint`);
        }
      } catch (error) {
        console.log('Basic products endpoint failed:', error.message);
      }

      // Second try: Collections/all endpoint if basic failed
      if (!productData || productData.length === 0) {
        try {
          const response = await axios.get(`${storeUrl}/collections/all/products.json`, {
            headers: this.baseHeaders,
            timeout: 10000
          });
          
          if (response.data && response.data.products) {
            productData = response.data.products;
            console.log(`Found ${productData.length} products via collections/all endpoint`);
          }
        } catch (error) {
          console.log('Collections/all endpoint failed:', error.message);
        }
      }

      // Third try: Paginated requests to get ALL products
      if (productData && productData.length > 0) {
        let currentPage = 2;
        const maxPages = 1000; // Allow up to 1000 pages to get ALL products
        
        while (currentPage <= maxPages) {
          try {
            const response = await axios.get(`${storeUrl}/products.json?limit=250&page=${currentPage}`, {
              headers: this.baseHeaders,
              timeout: 10000
            });
            
            if (response.data && response.data.products && response.data.products.length > 0) {
              productData = productData.concat(response.data.products);
              console.log(`Added page ${currentPage}, total products: ${productData.length}`);
              
              // If we got less than 250, we've reached the end
              if (response.data.products.length < 250) {
                break;
              }
            } else {
              break;
            }
          } catch (error) {
            console.log(`Page ${currentPage} failed:`, error.message);
            break;
          }
          
          currentPage++;
          
          // Add a small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Fallback: scrape from HTML pages
      if (!productData || productData.length === 0) {
        productData = await this.scrapeProductsFromHTML(storeUrl, page, limit);
      }

      // Process products - NO LIMITS
      productData.forEach((product, index) => {
        const productId = product.id ? String(product.id) : `product-${index}`;
        const productCollections = collectionsMap.get(productId) || [];

        const processedProduct = {
          id: product.id || `product-${index}`,
          title: product.title || 'Untitled Product',
          handle: product.handle || this.generateHandle(product.title),
          vendor: product.vendor || 'Unknown',
          product_type: product.product_type || '',
          price: this.extractPrice(product.variants),
          compare_at_price: this.extractComparePrice(product.variants),
          currency: 'USD',
          images: this.extractImages(product.images),
          description: product.body_html || '',
          tags: product.tags || [],
          collections: productCollections,
          created_at: product.created_at || '',
          updated_at: product.updated_at || '',
          published_at: product.published_at || new Date().toISOString(),
          available: this.checkAvailability(product.variants),
          url: `${storeUrl}/products/${product.handle || product.id}`,
          variants: this.processVariants(product.variants, product.title, product.handle)
        };

        products.push(processedProduct);
      });

      totalProducts = products.length;
      hasMore = products.length === limit;

      return {
        products,
        total: totalProducts,
        hasMore,
        store: storeUrl
      };
    } catch (error) {
      console.error('Error scraping products:', error);
      throw new Error(`Failed to scrape products: ${error.message}`);
    }
  }

  async scrapeCollections(storeUrl, page = 1, limit = 999999) {
    try {
      const collections = [];
      
      // Try collections API endpoint
      const collectionsEndpoint = `${storeUrl}/collections.json?limit=${limit}&page=${page}`;
      
      try {
        const response = await axios.get(collectionsEndpoint, {
          headers: this.baseHeaders,
          timeout: 10000
        });

        if (response.data && response.data.collections) {
          response.data.collections.forEach((collection, index) => {
            const processedCollection = {
              id: collection.id || `collection-${index}`,
              title: collection.title || 'Untitled Collection',
              handle: collection.handle || '',
              description: collection.body_html ? this.stripHtml(collection.body_html) : '',
              image: collection.image ? collection.image.src : null,
              products_count: collection.products_count || 0,
              published_at: collection.published_at || '',
              updated_at: collection.updated_at || '',
              url: `${storeUrl}/collections/${collection.handle || collection.id}`
            };

            collections.push(processedCollection);
          });

          return {
            collections,
            total: collections.length,
            hasMore: collections.length === limit,
            store: storeUrl
          };
        }
      } catch (error) {
        console.log('Collections API failed, trying HTML scraping...');
      }

      // Fallback: scrape from HTML
      return await this.scrapeCollectionsFromHTML(storeUrl, page, limit);
    } catch (error) {
      console.error('Error scraping collections:', error);
      throw new Error(`Failed to scrape collections: ${error.message}`);
    }
  }

  async scrapeProductsFromHTML(storeUrl, page = 1, limit = 999999) {
    try {
      const products = [];
      const collections = ['all', 'featured', 'new-arrivals'];
      
      for (const collection of collections) {
        if (products.length >= limit) break;
        
        try {
          const response = await axios.get(`${storeUrl}/collections/${collection}`, {
            headers: this.baseHeaders,
            timeout: 10000
          });

          const $ = cheerio.load(response.data);
          
        $('.product-item, .product-card, .grid-product__content').each((index, element) => {

            const $el = $(element);
            const product = {
              id: `html-${products.length}`,
              title: $el.find('.product-title, .product-card__title, .grid-product__title').text().trim() || 'Untitled Product',
              handle: $el.find('a').attr('href')?.split('/').pop() || '',
              vendor: $el.find('.product-vendor, .vendor').text().trim() || 'Unknown',
              price: $el.find('.price, .product-price').text().trim() || '0',
              image: $el.find('img').first().attr('src') || '',
              url: $el.find('a').attr('href') ? `${storeUrl}${$el.find('a').attr('href')}` : ''
            };

            products.push(product);
          });
        } catch (error) {
          console.log(`Failed to scrape collection ${collection}:`, error.message);
        }
      }

      return products;
    } catch (error) {
      console.error('HTML scraping error:', error);
      return [];
    }
  }

  async scrapeCollectionsFromHTML(storeUrl, page = 1, limit = 999999) {
    try {
      const collections = [];
      
      try {
        const response = await axios.get(`${storeUrl}/collections`, {
          headers: this.baseHeaders,
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        
        $('.collection-item, .collection-card, .grid-item').each((index, element) => {

          const $el = $(element);
          const collection = {
            id: `html-collection-${collections.length}`,
            title: $el.find('.collection-title, .collection-card__title, .grid-item__title').text().trim() || 'Untitled Collection',
            handle: $el.find('a').attr('href')?.split('/').pop() || '',
            description: $el.find('.collection-description').text().trim() || '',
            image: $el.find('img').first().attr('src') || '',
            products_count: 0,
            url: $el.find('a').attr('href') ? `${storeUrl}${$el.find('a').attr('href')}` : ''
          };

          collections.push(collection);
        });
      } catch (error) {
        console.log('Collections HTML scraping failed:', error.message);
      }

      return {
        collections,
        total: collections.length,
        hasMore: false,
        store: storeUrl
      };
    } catch (error) {
      console.error('Collections HTML scraping error:', error);
      return { collections: [], total: 0, hasMore: false, store: storeUrl };
    }
  }

  extractPrice(variants) {
    if (!variants || variants.length === 0) return '0';
    const firstVariant = variants[0];
    return firstVariant.price || '0';
  }

  extractComparePrice(variants) {
    if (!variants || variants.length === 0) return null;
    const firstVariant = variants[0];
    return firstVariant.compare_at_price || null;
  }

  extractImages(images) {
    if (!images || images.length === 0) return [];
    return images.map(img => ({
      src: img.src || img,
      alt: img.alt || ''
    }));
  }

  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  checkAvailability(variants) {
    if (!variants || variants.length === 0) return false;
    return variants.some(variant => variant.available);
  }

  generateHandle(title) {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  processVariants(variants, productTitle, productHandle) {
    if (!variants || variants.length === 0) {
      // Return empty array if no variants - don't create fake ones
      return [];
    }

    return variants.map((variant, index) => ({
      id: variant.id || `${productHandle || productTitle}-variant-${index}`,
      title: variant.title || variant.option1 || `Variant ${index + 1}`,
      option1: variant.option1 || variant.title,
      option1_name: variant.option1_name || 'Size',
      option2: variant.option2 || '',
      option2_name: variant.option2_name || '',
      option3: variant.option3 || '',
      option3_name: variant.option3_name || '',
      price: variant.price || '0',
      compare_at_price: variant.compare_at_price || '',
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      available: variant.available !== false,
      inventory_quantity: variant.inventory_quantity || 0,
      weight: variant.weight || 0,
      weight_unit: variant.weight_unit || 'kg',
      requires_shipping: variant.requires_shipping !== false,
      taxable: variant.taxable !== false,
      image: variant.image || null
    }));
  }

  async fetchCollectionsWithProducts(storeUrl) {
    const collectionsMap = new Map();

    try {
      console.log('Fetching collections...');
      const response = await axios.get(`${storeUrl}/collections.json`, {
        headers: this.baseHeaders,
        timeout: 10000
      });

      if (response.data && response.data.collections) {
        const collections = response.data.collections;
        console.log(`Found ${collections.length} collections`);

        for (const collection of collections) {
          try {
            const collectionResponse = await axios.get(`${storeUrl}/collections/${collection.handle}/products.json`, {
              headers: this.baseHeaders,
              timeout: 10000
            });

            if (collectionResponse.data && collectionResponse.data.products) {
              collectionResponse.data.products.forEach(product => {
                const productId = String(product.id);
                if (!collectionsMap.has(productId)) {
                  collectionsMap.set(productId, []);
                }
                collectionsMap.get(productId).push({
                  id: collection.id,
                  title: collection.title,
                  handle: collection.handle
                });
              });
            }

            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.log(`Failed to fetch products for collection ${collection.handle}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.log('Failed to fetch collections:', error.message);
    }

    console.log(`Mapped ${collectionsMap.size} products to collections`);
    return collectionsMap;
  }
}

// Create singleton instance
const scraper = new ShopifyScraper();

// Export the main scraping function
module.exports = {
  scrapeShopifyStore: (url, type, page, limit) => scraper.scrapeShopifyStore(url, type, page, limit)
};
