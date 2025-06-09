import { Router } from 'express';
import { UrlController } from '../controllers/urlController';

const router = Router();

// POST /shorten - Create short URL
router.post('/shorten', UrlController.shortenUrl);

// GET /:shortCode - Redirect to original URL
router.get('/:shortCode', UrlController.redirectToUrl);

// GET /stats/:shortCode - Get URL statistics
router.get('/stats/:shortCode', UrlController.getUrlStats);

export default router; 