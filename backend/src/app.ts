import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { redisClient } from './config/redis';
import urlRoutes from './routes/urlRoutes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const mongoStatus = mongoose.connection.readyState === 1;
        const redisStatus = await redisClient.healthCheck();

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            services: {
                mongodb: mongoStatus ? 'connected' : 'disconnected',
                redis: redisStatus ? 'connected' : 'disconnected'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});

// Routes
app.use('/', urlRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB and Redis, then start server
async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongoUri);
        console.log('Connected to MongoDB');

        // Connect to Redis
        await redisClient.connect();
        console.log('Connected to Redis');

        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
            console.log(`Health check: http://localhost:${config.port}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await mongoose.disconnect();
    await redisClient.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await mongoose.disconnect();
    await redisClient.disconnect();
    process.exit(0);
});

startServer();

export default app; 