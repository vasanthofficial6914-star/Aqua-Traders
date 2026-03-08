// Deployment URLs
// Priority: VITE_API_URL > VITE_BACKEND_URL > fallback to production
const DEFAULT_BACKEND = 'https://fisher-man.onrender.com';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || `${import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND}/api`).replace(/\/+$/, '');
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace('/api', '')).replace(/\/+$/, '');


// Hardware WebSocket URL
export const HARDWARE_WS_URL = import.meta.env.VITE_HARDWARE_WS_URL || 'wss://fisher-man.onrender.com/hardware';
