import React, { useState } from 'react';
import { Link, Copy, ExternalLink } from 'lucide-react';
import { urlService } from '../services/api';
import type { ShortenUrlResponse } from '../services/api'

interface UrlShortenerProps {
    onUrlShortened: (shortUrl: string, shortCode: string) => void;
}

const UrlShortener: React.FC<UrlShortenerProps> = ({ onUrlShortened }) => {
    const [longUrl, setLongUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [shortUrlData, setShortUrlData] = useState<ShortenUrlResponse | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!longUrl.trim()) {
            setError('Please enter a URL');
            return;
        }

        // Basic URL validation
        try {
            new URL(longUrl);
        } catch {
            setError('Please enter a valid URL');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await urlService.shortenUrl({ url: longUrl });
            setShortUrlData(response);
            onUrlShortened(response.shortUrl, response.shortCode);
            setLongUrl('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to shorten URL');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    return (
        <div className="url-shortener">
            <form onSubmit={handleSubmit} className="url-form">
                <div className="input-group">
                    <input
                        type="url"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        placeholder="Enter your long URL here..."
                        className="url-input"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="shorten-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Shortening...' : 'Shorten URL'}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
            </form>

            {shortUrlData && (
                <div className="result-section">
                    <div className="short-url-card">
                        <div className="short-url-header">
                            <Link className="icon" />
                            <h3>Your Shortened URL</h3>
                        </div>

                        <div className="short-url-content">
                            <div className="url-display">
                                <span className="short-url">{shortUrlData.shortUrl}</span>
                                <button
                                    onClick={() => copyToClipboard(shortUrlData.shortUrl)}
                                    className="copy-btn"
                                    title="Copy to clipboard"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>

                            <div className="original-url">
                                <span className="label">Original:</span>
                                <a
                                    href={shortUrlData.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="original-link"
                                >
                                    {shortUrlData.originalUrl}
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UrlShortener; 