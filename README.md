# Shopify Scraper

A comprehensive web application for scraping product and collection data from Shopify stores, built with React and Node.js.

## Features

- **Product Scraping**: Extract product information including titles, prices, images, descriptions, and more
- **Collection Scraping**: Scrape product collections with metadata
- **Real-time Search**: Live filtering and search within scraped data
- **Export Functionality**: Export data to CSV and JSON formats
- **Pagination**: Handle large datasets with efficient pagination
- **Responsive Design**: Mobile-friendly interface matching the original design
- **Professional UI**: Clean, modern interface similar to shopify-scraper.com

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Axios** for HTTP requests
- **Cheerio** for HTML parsing
- **CORS** for cross-origin requests
- **Helmet** for security
- **Rate limiting** for API protection

### Frontend
- **React 18** with functional components
- **Lucide React** for icons
- **CSS3** with modern styling
- **Responsive design** for all screen sizes

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopify-scrapper
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Usage

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Enter a Shopify store URL** in the search input field
   - Example: `https://example-store.myshopify.com`
   - Or any valid Shopify store domain

3. **Select data type** (Products or Collections)

4. **Click the search button** to start scraping

5. **View results** in the table format with options to:
   - Filter and search within results
   - Select individual items or all items
   - Export selected data
   - Navigate through pages

## API Endpoints

### POST `/api/scraper/scrape`
Scrape a Shopify store for products or collections.

**Request Body:**
```json
{
  "url": "https://example-store.myshopify.com",
  "type": "products", // or "collections"
  "page": 1,
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...], // or "collections"
    "total": 100,
    "hasMore": true,
    "store": "https://example-store.myshopify.com"
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "hasMore": true
  }
}
```

### GET `/api/scraper/products/:storeId`
Scrape products from a specific store ID.

### GET `/api/scraper/collections/:storeId`
Scrape collections from a specific store ID.

### GET `/api/health`
Health check endpoint.

## Project Structure

```
shopify-scrapper/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.js
│   │   │   ├── SearchSection.js
│   │   │   ├── ResultsSection.js
│   │   │   ├── ProductsTable.js
│   │   │   ├── CollectionsTable.js
│   │   │   └── Pagination.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/
│   │   └── scraper.js      # API routes
│   ├── services/
│   │   └── shopifyScraper.js # Scraping logic
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Features Overview

### Scraping Capabilities
- **Multiple endpoints**: Tries various Shopify API endpoints for maximum compatibility
- **HTML fallback**: Falls back to HTML scraping when API endpoints fail
- **Error handling**: Robust error handling with user-friendly messages
- **Rate limiting**: Built-in rate limiting to prevent abuse

### UI Features
- **Professional design**: Matches the original shopify-scraper.com design
- **Responsive layout**: Works on desktop, tablet, and mobile devices
- **Real-time search**: Live filtering of results
- **Bulk selection**: Select all or individual items
- **Export options**: Multiple export formats (CSV, JSON)

### Data Processing
- **Product data**: Title, price, images, description, vendor, type, availability
- **Collection data**: Title, description, product count, metadata
- **Image handling**: Automatic fallback for missing images
- **Price formatting**: Proper currency and comparison price handling

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Backend Only
```bash
npm run server
```

### Running Frontend Only
```bash
npm run client
```

### Building for Production
```bash
npm run build
```

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:3000)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is for educational and research purposes only. Always respect website terms of service and robots.txt files. Use responsibly and in accordance with applicable laws and regulations.
