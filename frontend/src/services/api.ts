import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ShortenUrlRequest {
  url: string;
}

export interface ShortenUrlResponse {
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
}

export interface UrlStats {
  longUrl: string;
  clicks: number;
  createdAt: string;
  shortCode: string;
}

export const urlService = {
  shortenUrl: async (data: ShortenUrlRequest): Promise<ShortenUrlResponse> => {
    const response = await api.post<ShortenUrlResponse>('/shorten', data);
    return response.data;
  },

  getStats: async (shortCode: string): Promise<UrlStats> => {
    const response = await api.get<UrlStats>(`/stats/${shortCode}`);
    return response.data;
  },
};

export default api; 