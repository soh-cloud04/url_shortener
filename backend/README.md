# URL Shortener Backend

A TypeScript Express application for URL shortening with MongoDB integration.

## Features

- URL shortening with unique 5-character codes
- Collision detection and progressive lengthening
- Click tracking and analytics
- Rate limiting
- MongoDB integration with indexing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and other settings.

## Development

```bash
npm run dev
```

## Build and Run

```bash
npm run build
npm start
```

## API Endpoints

### POST /shorten
Create a short URL

**Body:**
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
Redirect to original URL

### GET /stats/:shortCode
Get URL statistics

**Response:**
```json
{
  "longUrl": "https://www.example.com",
  "clicks": 123,
  "createdAt": "2025-01-09",
  "shortCode": "abcde"
}
```

## Database Schema

### URL Document
```json
{
  "_id": "ObjectId",
  "longUrl": "https://www.example.com",
  "shortCode": "abcde",
  "createdAt": "2025-01-09T10:00:00.000Z",
  "clicks": 123,
  "salt": 42
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Configurable via environment variables 