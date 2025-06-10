import { redisClient, RedisClient } from '../config/redis';
import { IUrl } from '../models/url';

export interface CachedUrl {
  _id: string;
  longUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
  salt?: number;
}

export interface CachedStats {
  longUrl: string;
  clicks: number;
  createdAt: string;
  shortCode: string;
}

export class CacheService {
  private static instance: CacheService;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // URL caching
  async cacheUrl(url: IUrl): Promise<void> {
    try {
      const cachedUrl: CachedUrl = {
        _id: url._id.toString(),
        longUrl: url.longUrl,
        shortCode: url.shortCode,
        createdAt: url.createdAt.toISOString(),
        clicks: url.clicks,
        salt: url.salt,
      };

      const key = RedisClient.getUrlKey(url.shortCode);
      await redisClient.set(key, JSON.stringify(cachedUrl), 60 * 60 * 24 * 7); // 7 days

      // Also cache the shortCode for longUrl lookup
      const shortCodeKey = RedisClient.getShortCodeKey(url.longUrl);
      await redisClient.set(shortCodeKey, url.shortCode, 60 * 60 * 24); // 1 day
    } catch (error) {
      console.error('Error caching URL:', error);
    }
  }

  async getCachedUrl(shortCode: string): Promise<CachedUrl | null> {
    try {
      const key = RedisClient.getUrlKey(shortCode);
      const cached = await redisClient.get(key);
      
      if (cached) {
        return JSON.parse(cached) as CachedUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached URL:', error);
      return null;
    }
  }

  async getCachedShortCode(longUrl: string): Promise<string | null> {
    try {
      const key = RedisClient.getShortCodeKey(longUrl);
      return await redisClient.get(key);
    } catch (error) {
      console.error('Error getting cached shortCode:', error);
      return null;
    }
  }

  // Stats caching
  async cacheStats(stats: CachedStats): Promise<void> {
    try {
      const key = RedisClient.getStatsKey(stats.shortCode);
      await redisClient.set(key, JSON.stringify(stats), 60 * 60); // 1 hour
    } catch (error) {
      console.error('Error caching stats:', error);
    }
  }

  async getCachedStats(shortCode: string): Promise<CachedStats | null> {
    try {
      const key = RedisClient.getStatsKey(shortCode);
      const cached = await redisClient.get(key);
      
      if (cached) {
        return JSON.parse(cached) as CachedStats;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached stats:', error);
      return null;
    }
  }

  // Click tracking with Redis
  async incrementClicks(shortCode: string): Promise<number> {
    try {
      const key = RedisClient.getClicksKey(shortCode);
      const clicks = await redisClient.incr(key);
      
      // Set TTL for click counter
      await redisClient.expire(key, 60 * 60 * 24); // 1 day
      
      return clicks;
    } catch (error) {
      console.error('Error incrementing clicks:', error);
      return 0;
    }
  }

  async getCachedClicks(shortCode: string): Promise<number> {
    try {
      const key = RedisClient.getClicksKey(shortCode);
      const clicks = await redisClient.get(key);
      return clicks ? parseInt(clicks) : 0;
    } catch (error) {
      console.error('Error getting cached clicks:', error);
      return 0;
    }
  }

  // Cache invalidation
  async invalidateUrl(shortCode: string): Promise<void> {
    try {
      const urlKey = RedisClient.getUrlKey(shortCode);
      const statsKey = RedisClient.getStatsKey(shortCode);
      
      await redisClient.del(urlKey);
      await redisClient.del(statsKey);
    } catch (error) {
      console.error('Error invalidating URL cache:', error);
    }
  }

  async invalidateStats(shortCode: string): Promise<void> {
    try {
      const key = RedisClient.getStatsKey(shortCode);
      await redisClient.del(key);
    } catch (error) {
      console.error('Error invalidating stats cache:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await redisClient.set('health:check', 'ok', 10);
      const result = await redisClient.get('health:check');
      return result === 'ok';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

export const cacheService = CacheService.getInstance(); 