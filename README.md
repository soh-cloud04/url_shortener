# URL Shortener Application

A full-stack URL shortening application built with TypeScript, featuring a React frontend and Express.js backend with MongoDB and Redis for high-performance caching.

## 🚀 Features

### Backend Features

#### Core URL Shortening
- **POST /shorten** - Create short URLs from long URLs
- **GET /:shortCode** - Redirect to original URLs
- **GET /stats/:shortCode** - Get URL analytics and statistics
- **GET /health** - Health check endpoint with service status

#### Advanced URL Generation
- **Unique Short Codes**: 5-character base62 encoded codes
- **Collision Detection**: Automatic retry with different codes
- **Progressive Lengthening**: Falls back to 6-character codes if needed
- **Salt-based Uniqueness**: Even same URLs get different short codes
- **ObjectId-based Generation**: Uses MongoDB ObjectId for encoding

#### Database & Caching
- **MongoDB Integration**: Primary data storage with Mongoose ODM
- **Redis Caching**: High-performance caching for URLs and statistics
- **Cache Invalidation**: Automatic cache updates on data changes
- **Click Tracking**: Real-time click counting with Redis atomic operations
- **Database Indexing**: Optimized queries with shortCode indexing

#### Performance & Scalability
- **Rate Limiting**: Express-rate-limit with configurable thresholds
- **Redis Caching Strategy**:
  - URLs: 7-day cache (frequently accessed)
  - Stats: 1-hour cache (moderate updates)
  - Click counters: 1-day cache with atomic increments
  - ShortCode lookups: 1-day cache (URL to shortCode mapping)
- **Connection Pooling**: Optimized MongoDB and Redis connections
- **Graceful Shutdown**: Proper cleanup on server termination

#### Security & Validation
- **Input Validation**: URL format validation and sanitization
- **CORS Configuration**: Cross-origin resource sharing setup
- **Helmet Security**: Security headers and protection
- **Error Handling**: Comprehensive error handling and logging
- **Environment Configuration**: Secure environment variable management

#### Development & Testing
- **TypeScript**: Full type safety and modern JavaScript features
- **ESLint & Prettier**: Code quality and formatting
- **Jest Testing**: Comprehensive unit and integration tests
- **MongoDB Memory Server**: In-memory database for testing
- **Hot Reloading**: Development server with automatic restarts

### Frontend Features

#### User Interface
- **Modern React**: Built with React 19 and TypeScript
- **Responsive Design**: Mobile-first responsive layout
- **Beautiful UI**: Gradient backgrounds and smooth animations
- **Real-time Updates**: Live statistics with auto-refresh
- **Loading States**: Proper loading indicators and error handling

#### URL Shortening Interface
- **URL Input Form**: Clean form with validation
- **Copy to Clipboard**: One-click copying of shortened URLs
- **External Link Icons**: Clear visual indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Clear success states and confirmations

#### Live Statistics Dashboard
- **Real-time Stats**: Auto-updating statistics every 5 seconds
- **Click Tracking**: Live click count display
- **Creation Date**: URL creation timestamp
- **Original URL Display**: Easy access to original URLs
- **Visual Indicators**: Icons and color-coded information

#### Technical Features
- **Axios Integration**: HTTP client for API communication
- **Environment Configuration**: Configurable API endpoints
- **Type Safety**: Full TypeScript integration
- **Component Architecture**: Modular, reusable components
- **State Management**: React hooks for state management

## 🏗️ Architecture

### Backend Architecture 
```bash
backend/
├── src/
│ ├── config/
│ │ ├── index.ts # Application configuration
│ │ └── redis.ts # Redis client configuration
│ ├── controllers/
│ │ └── urlController.ts # URL shortening logic
│ ├── models/
│ │ └── url.ts # MongoDB schema
│ ├── routes/
│ │ └── urlRoutes.ts # API route definitions
│ ├── services/
│ │ └── cacheService.ts # Redis caching service
│ ├── utils/
│ │ └── base62.ts # Base62 encoding utilities
│ └── app.ts # Express application setup
├── tests/ # Jest test files
├── package.json
├── tsconfig.json
```

### Frontend Architecture 
```bash
├── src/
│ ├── components/
│ │ ├── UrlShortener.tsx # URL shortening form
│ │ └── LiveStats.tsx # Statistics dashboard
│ ├── services/
│ │ └── api.ts # API service layer
│ ├── App.tsx # Main application component
│ └── main.tsx # Application entry point
├── public/
├── package.json
└── vite.config.ts
```

## 📊 Database Schema

### URL Document (MongoDB)
```json
{
  "_id": "ObjectId",
  "longUrl": "https://www.example.com",
  "shortCode": "abcde",
  "createdAt": "2024-01-09T10:00:00.000Z",
  "clicks": 123,
  "salt": 42
}
```

### Cache Keys (Redis)
- `url:{shortCode}` - Cached URL data (7 days TTL)
- `stats:{shortCode}` - Cached statistics (1 hour TTL)
- `clicks:{shortCode}` - Click counter (1 day TTL)
- `shortcode:{base64Url}` - URL to shortCode mapping (1 day TTL)

## 🔧 API Endpoints

### POST /shorten
Create a new short URL.

**Request:**
```json
{
  "url": "https://www.example.com"
}
```

**Response:**
```json
{
  "originalUrl": "https://www.example.com",
  "shortUrl": "http://localhost:3000/abcde",
  "shortCode": "abcde"
}
```

### GET /:shortCode
Redirect to the original URL.

**Response:** 302 Redirect to original URL

### GET /stats/:shortCode
Get URL statistics.

**Response:**
```json
{
  "longUrl": "https://www.example.com",
  "clicks": 123,
  "createdAt": "2024-01-09",
  "shortCode": "abcde"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-09T10:00:00.000Z",
  "services": {
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- Redis 6+
- npm or yarn

### Backend Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url_shortener/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/url-shortener
   BASE_URL=http://localhost:3000
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   ```

4. **Start MongoDB and Redis**
   ```bash
   # MongoDB
   mongod
   
   # Redis
   redis-server
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   echo "VITE_API_URL=http://localhost:3000" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📈 Performance Features

### Caching Strategy
- **URL Cache**: 7-day TTL for frequently accessed URLs
- **Stats Cache**: 1-hour TTL for analytics data
- **Click Counters**: Redis atomic operations for real-time tracking
- **Cache Invalidation**: Automatic updates on data changes

### Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Adjustable via environment variables
- **Headers**: Standard rate limit headers included

### Database Optimization
- **Indexing**: ShortCode field indexed for fast lookups
- **Connection Pooling**: Optimized MongoDB connections
- **Query Optimization**: Efficient database queries

## 🔒 Security Features

### Input Validation
- URL format validation
- XSS protection
- SQL injection prevention

### Security Headers
- Helmet.js integration
- CORS configuration
- Content Security Policy

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Graceful failure handling

## 🤔 Development Tools

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety and modern JavaScript
- **Jest**: Unit and integration testing

### Development Experience
- **Hot Reloading**: Automatic server restarts
- **TypeScript Compilation**: Real-time type checking
- **Debugging**: Source maps and debugging support
- **Environment Management**: Separate dev/prod configurations

## 📱 Frontend Components

### UrlShortener Component
- URL input validation
- Form submission handling
- Error state management
- Success feedback display
- Copy to clipboard functionality

### LiveStats Component
- Real-time statistics display
- Auto-refresh functionality
- Loading and error states
- Responsive design
- Visual data presentation

## 🔄 Data Flow

1. **URL Shortening**:
   - User submits long URL
   - Backend validates and generates short code
   - URL stored in MongoDB and cached in Redis
   - Short URL returned to frontend

2. **URL Redirection**:
   - User clicks short URL
   - Backend checks Redis cache first
   - If not cached, queries MongoDB
   - Increments click counter atomically
   - Redirects to original URL

3. **Statistics**:
   - Frontend polls stats every 5 seconds
   - Backend serves from cache when available
   - Cache invalidated on data changes
   - Real-time updates displayed

## 🚀 Deployment

### Backend Deployment
- Build TypeScript: `npm run build`
- Set environment variables
- Start with PM2 or Docker
- Configure MongoDB and Redis connections

### Frontend Deployment
- Build for production: `npm run build`
- Deploy to CDN or static hosting
- Configure API endpoint
- Enable HTTPS

## 📊 Monitoring

### Health Checks
- MongoDB connection status
- Redis connection status
- Application uptime
- Service availability

### Performance Metrics
- Response times
- Cache hit rates
- Database query performance
- Memory usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for examples

## 🔄 Version History

- **v1.0.0**: Initial release with core URL shortening functionality
- **v1.1.0**: Added Redis caching for improved performance
- **v1.2.0**: Enhanced frontend with live statistics
- **v1.3.0**: Added comprehensive testing and documentation

---

**Built with ❤️ using TypeScript, React, Express.js, MongoDB, and Redis**