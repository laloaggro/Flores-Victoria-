// Frontend API client configuration (placeholder)
const API_CONFIG = {
  baseURL: process.env.API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
