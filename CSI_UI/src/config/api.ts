// API Configuration
// In production, the API is served from the same host through nginx proxy

export const getApiBaseUrl = (): string => {
  // In development, use the environment variable
  if (import.meta.env.DEV && import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL;
  }
  
  // In production, API is proxied through nginx at /api
  // This allows the frontend and backend to be served from the same host
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const basePort = port ? `:${port}` : '';
    return `${protocol}//${hostname}${basePort}/api`;
  }
  
  // Fallback
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// WebSocket configuration for real-time updates
export const getWebSocketUrl = (): string => {
  if (import.meta.env.DEV && import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    const basePort = port ? `:${port}` : '';
    return `${wsProtocol}//${hostname}${basePort}`;
  }
  
  return 'ws://localhost:8080';
};

export const WS_URL = getWebSocketUrl();