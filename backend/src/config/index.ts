import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/url-shortener',
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // limit each IP to 100 requests per windowMs
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  cache: {
    urlTTL: 60 * 60 * 24 * 7, // 7 days
    statsTTL: 60 * 60, // 1 hour
    clicksTTL: 60 * 60 * 24, // 1 day
  },
}; 