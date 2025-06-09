import { Request, Response } from 'express';
import { Url, IUrl, generateUniqueId } from '../models/url';
import { generateShortCode, generateRandomCode } from '../utils/base62';
import { config } from '../config';

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

            // Check if URL already exists
            const existingUrl = await Url.findOne({ longUrl });
            if (existingUrl) {
                // Generate a new short code for the same URL (different salt)
                const _id = generateUniqueId();
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

                res.status(201).json({
                    originalUrl: longUrl,
                    shortUrl: `${config.baseUrl}/${finalShortCode}`,
                    shortCode: finalShortCode
                });
                return;
            }
            // Generate a unique id for the url
            const _id = generateUniqueId();

            // Create new URL entry
            const newUrl = new Url({ _id, longUrl });

            // Generate short code with retry logic
            const shortCode = await UrlController.generateUniqueCode(
                generateShortCode(_id.toString())
            );

            // Update with the final short code
            newUrl.shortCode = shortCode;
            await newUrl.save();

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

            const url = await Url.findOne({ shortCode });
            if (!url) {
                res.status(404).json({ error: 'Short URL not found' });
                return;
            }

            // Increment click count
            url.clicks += 1;
            await url.save();

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
} 