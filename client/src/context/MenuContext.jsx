import { createContext, useContext, useEffect, useState } from 'react';
import { normalizeMenuPayload } from '../lib/arrays';
import { getMenu } from '../services/menuService';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { fallbackRestaurantName, getRestaurantName } from '../lib/brand';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ categories: [], foods: [], settings: null, availableSeats: [] });
  const [restaurantName, setRestaurantName] = useState(fallbackRestaurantName);

  async function refresh() {
    setLoading(true);
    try {
      const [menuResult, brandResult] = await Promise.allSettled([
        getMenu(),
        api.get('/api/brand')
      ]);

      if (brandResult.status === 'fulfilled') {
        setRestaurantName(getRestaurantName(brandResult.value.data?.name));
      } else {
        setRestaurantName(fallbackRestaurantName);
      }

      if (menuResult.status === 'rejected') throw menuResult.reason;
      setData(normalizeMenuPayload(menuResult.value));
      setError('');
    } catch (err) {
      setData({ categories: [], foods: [], settings: null, availableSeats: [] });
      setError(!navigator.onLine ? 'You are offline. Reconnect to load the current menu.' : (err.response?.data?.message || 'Failed to load menu'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    socket.on('menu:updated', refresh);
    return () => {
      socket.off('menu:updated', refresh);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    document.title = restaurantName;
    const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitle) appleTitle.content = restaurantName;
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.rel = 'manifest';
      document.head.appendChild(manifest);
    }
    manifest.href = `${api.defaults.baseURL}/api/manifest.webmanifest`;
  }, [restaurantName]);

  return <MenuContext.Provider value={{ ...normalizeMenuPayload(data), restaurantName, loading, error, refresh }}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return context;
}
