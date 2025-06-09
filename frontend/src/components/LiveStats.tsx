import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, MousePointer } from 'lucide-react';
import { urlService } from '../services/api';
import type { UrlStats } from '../services/api'

interface LiveStatsProps {
    shortCode: string | null;
}

const LiveStats: React.FC<LiveStatsProps> = ({ shortCode }) => {
    const [stats, setStats] = useState<UrlStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchStats = async () => {
        if (!shortCode) return;

        setIsLoading(true);
        setError('');

        try {
            const data = await urlService.getStats(shortCode);
            setStats(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch stats');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (shortCode) {
            fetchStats();

            // Set up polling for live updates every 5 seconds
            const interval = setInterval(fetchStats, 5000);

            return () => clearInterval(interval);
        }
    }, [shortCode]);

    if (!shortCode) {
        return (
            <div className="stats-placeholder">
                <BarChart3 className="icon" />
                <p>Shorten a URL to see live statistics</p>
            </div>
        );
    }

    if (isLoading && !stats) {
        return (
            <div className="stats-loading">
                <div className="loading-spinner"></div>
                <p>Loading statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="stats-error">
                <p>Error: {error}</p>
                <button onClick={fetchStats} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="live-stats">
            <div className="stats-header">
                <BarChart3 className="icon" />
                <h3>Live Statistics</h3>
                <span className="live-indicator">LIVE</span>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <MousePointer />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.clicks}</span>
                        <span className="stat-label">Total Clicks</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <TrendingUp />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.shortCode}</span>
                        <span className="stat-label">Short Code</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Clock />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{formatDate(stats.createdAt)}</span>
                        <span className="stat-label">Created</span>
                    </div>
                </div>
            </div>

            <div className="original-url-stats">
                <span className="label">Original URL:</span>
                <a
                    href={stats.longUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="original-link"
                >
                    {stats.longUrl}
                </a>
            </div>

            <div className="refresh-info">
                <p>Stats update automatically every 5 seconds</p>
            </div>
        </div>
    );
};

export default LiveStats; 