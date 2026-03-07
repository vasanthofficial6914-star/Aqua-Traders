// Deployment URLs
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const API_BASE_URL = `${BACKEND_URL}/api`;

// Hardware WebSocket URL
export const HARDWARE_WS_URL = import.meta.env.VITE_HARDWARE_WS_URL || 'ws://localhost:5001/hardware';
