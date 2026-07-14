import axios from 'axios';

export const ADMIN_TOKEN_KEY = 'restaurant_admin_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isServerUnavailable = !error.response || [500, 502, 503, 504].includes(status);
    if (isServerUnavailable && error.code !== 'ERR_CANCELED' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('restaurant:server-down'));
    }
    return Promise.reject(error);
  }
);
