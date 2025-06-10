import { Request, Response } from 'express';
import { Url, IUrl, generateUniqueId } from '../models/url';
import { generateShortCode, generateRandomCode } from '../utils/base62';
import { config } from '../config';
import { cacheService } from '../services/cacheService';

export class UrlController {
    // POST /shorten
    static async shortenUrl(req: Request, res: Response): Promise<void> {
        try {
            const { url: longUrl } = req.body;

            if (!longUrl) {
                res.status(400).json({ error: 'URL is required' });
                return;
            }

            // Validate URL format
            try {
                new URL(longUrl);
            } catch {
                res.status(400).json({ error: 'Invalid URL format' });
                return;
            }

            // generate id for new url
            const _id = generateUniqueId();

            // Check cache first for existing URL
            const cachedShortCode = await cacheService.getCachedShortCode(longUrl);
            if (cachedShortCode) {
                // Check if the cached shortCode still exists in DB
                const existingUrl = await Url.findOne({ shortCode: cachedShortCode });
                if (existingUrl) {
                    // Generate a new short code for the same URL (different salt)
                    const salt = Math.floor(Math.random() * 100);
                    const shortCode = generateShortCode(_id.toString(), salt);

                    // Check for collision and retry if needed
                    const finalShortCode = await UrlController.generateUniqueCode(shortCode);

                    const newUrl = new Url({
                        _id,
                        longUrl,
                        shortCode: finalShortCode,
                        salt
                    });

                    await newUrl.save();

                    // Cache the new URL
                    await cacheService.cacheUrl(newUrl);

                    res.status(201).json({
                        originalUrl: longUrl,
                        shortUrl: `${config.baseUrl}/${finalShortCode}`,
                        shortCode: finalShortCode
                    });
                    return;
                }
            }

            // Check if URL already exists in database
            const existingUrl = await Url.findOne({ longUrl });
            if (existingUrl) {
                // Generate a new short code for the same URL (different salt)
                const salt = Math.floor(Math.random() * 100);
                const shortCode = generateShortCode(_id.toString(), salt);

                // Check for collision and retry if needed
                const finalShortCode = await UrlController.generateUniqueCode(shortCode);

                const newUrl = new Url({
                    _id,
                    longUrl,
                    shortCode: finalShortCode,
                    salt
                });

                await newUrl.save();

                // Cache the new URL
                await cacheService.cacheUrl(newUrl);

                res.status(201).json({
                    originalUrl: longUrl,
                    shortUrl: `${config.baseUrl}/${finalShortCode}`,
                    shortCode: finalShortCode
                });
                return;
            }

            // Create new URL entry
            const newUrl = new Url({ _id, longUrl, shortCode: "" });

            // Generate short code with retry logic
            const shortCode = await UrlController.generateUniqueCode(
                generateShortCode(_id.toString())
            );

            // Update with the final short code
            newUrl.shortCode = shortCode;
            await newUrl.save();

            // Cache the URL
            await cacheService.cacheUrl(newUrl);

            res.status(201).json({
                originalUrl: longUrl,
                shortUrl: `${config.baseUrl}/${shortCode}`,
                shortCode: shortCode
            });

        } catch (error) {
            console.error('Error shortening URL:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // GET /:shortCode
    static async redirectToUrl(req: Request, res: Response): Promise<void> {
        try {
            const { shortCode } = req.params;

            // Check cache first
            const cachedUrl = await cacheService.getCachedUrl(shortCode);
            if (cachedUrl) {
                // Increment clicks in cache
                const clicks = await cacheService.incrementClicks(shortCode);

                // Update database asynchronously (fire and forget)
                Url.findOneAndUpdate(
                    { shortCode },
                    { $inc: { clicks: 1 } },
                    { new: true }
                ).then(async (updatedUrl) => {
                    if (updatedUrl) {
                        // Update cache with new click count
                        await cacheService.cacheUrl(updatedUrl);
                        await cacheService.invalidateStats(shortCode); // Invalidate stats cache
                    }
                }).catch(error => {
                    console.error('Error updating clicks in database:', error);
                });

                res.redirect(cachedUrl.longUrl);
                return;
            }

            // If not in cache, check database
            const url = await Url.findOne({ shortCode });
            if (!url) {
                res.status(404).json({ error: 'Short URL not found' });
                return;
            }

            // Cache the URL for future requests
            await cacheService.cacheUrl(url);

            // Increment clicks
            url.clicks += 1;
            await url.save();

            // Update cache with new click count
            await cacheService.cacheUrl(url);
            await cacheService.invalidateStats(shortCode); // Invalidate stats cache

            // Redirect to original URL
            res.redirect(url.longUrl);

        } catch (error) {
            console.error('Error redirecting:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // GET /stats/:shortCode
    static async getUrlStats(req: Request, res: Response): Promise<void> {
        try {
            const { shortCode } = req.params;

            // Check cache first
            const cachedStats = await cacheService.getCachedStats(shortCode);
            if (cachedStats) {
                res.json(cachedStats);
                return;
            }

            // If not in cache, check database
            const url = await Url.findOne({ shortCode });
            if (!url) {
                res.status(404).json({ error: 'Short URL not found' });
                return;
            }

            const stats = {
                longUrl: url.longUrl,
                clicks: url.clicks,
                createdAt: url.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
                shortCode: url.shortCode
            };

            // Cache the stats
            await cacheService.cacheStats(stats);

            res.json(stats);

        } catch (error) {
            console.error('Error getting stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Helper method to generate unique short codes with collision handling
    private static async generateUniqueCode(initialCode: string, maxRetries: number = 5): Promise<string> {
        let code = initialCode;
        let retries = 0;

        while (retries < maxRetries) {
            // Check cache first
            const cachedUrl = await cacheService.getCachedUrl(code);
            if (cachedUrl) {
                // Collision in cache, try with random code
                code = generateRandomCode(5);
                retries++;
                continue;
            }

            // Check database
            const existing = await Url.findOne({ shortCode: code });
            if (!existing) {
                return code;
            }

            // If collision, try with random code
            code = generateRandomCode(5);
            retries++;
        }

        // If still colliding after max retries, use 6-character code
        return generateRandomCode(6);
    }
    // private static async generateUniqueCode(initialCode: string, maxRetries: number = 5): Promise<string> {
    //     let code = initialCode;
    //     let retries = 0;
    
    //     // Try with 5-character codes
    //     while (retries < maxRetries) {
    //         const cachedUrl = await cacheService.getCachedUrl(code);
    //         if (!cachedUrl) {
    //             const existing = await Url.findOne({ shortCode: code });
    //             if (!existing) {
    //                 return code;
    //             }
    //         }
    
    //         code = generateRandomCode(5);
    //         retries++;
    //     }
    
    //     // If all retries fail, keep trying with 6-character codes until success
    //     while (true) {
    //         code = generateRandomCode(5);
    
    //         const cachedUrl = await cacheService.getCachedUrl(code);
    //         if (cachedUrl) continue;
    
    //         const existing = await Url.findOne({ shortCode: code });
    //         if (!existing) {
    //             return code;
    //         }
    //     }
    // }
    
} 