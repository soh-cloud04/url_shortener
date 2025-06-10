import Redis from 'ioredis';
import { config } from './index';

class RedisClient {
  private client: Redis;
  private subscriber: Redis;

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      db: config.redis.db,
    });

    this.subscriber = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      db: config.redis.db,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    this.client.on('close', () => {
      console.log('Redis client connection closed');
    });

    this.subscriber.on('connect', () => {
      console.log('Redis subscriber connected');
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.subscriber.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      await this.subscriber.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
    }
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      console.error('Redis expire error:', error);
    }
  }

  // Cache key generators
  static getUrlKey(shortCode: string): string {
    return `url:${shortCode}`;
  }

  static getStatsKey(shortCode: string): string {
    return `stats:${shortCode}`;
  }

  static getClicksKey(shortCode: string): string {
    return `clicks:${shortCode}`;
  }

  static getShortCodeKey(longUrl: string): string {
    return `shortcode:${Buffer.from(longUrl).toString('base64')}`;
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

    // Health check method
    async healthCheck(): Promise<boolean> {
      try {
        await this.client.set('health:check', 'ok', 10);
        const result = await this.client.get('health:check');
        return result === 'ok';
      } catch (error) {
        console.error('Redis health check failed:', error);
        return false;
      }
    }
  
}

export const redisClient = new RedisClient();
export default redisClient; 