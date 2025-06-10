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

### Frontend Architecture 