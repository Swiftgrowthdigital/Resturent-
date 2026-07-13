import { createContext, useContext, useEffect, useState } from 'react';
import { normalizeMenuPayload } from '../lib/arrays';
import { getMenu } from '../services/menuService';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ categories: [], foods: [], settings: null, availableSeats: [] });

  async function refresh() {
    setLoading(true);
    try {
      setData(normalizeMenuPayload(await getMenu()));
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
    const restaurantName = data.settings?.name;
    if (!restaurantName) return;

    document.title = restaurantName;
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.rel = 'manifest';
      document.head.appendChild(manifest);
    }
    manifest.href = `${api.defaults.baseURL}/api/manifest.webmanifest`;
  }, [data.settings?.name]);

  return <MenuContext.Provider value={{ ...normalizeMenuPayload(data), loading, error, refresh }}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within MenuProvider');
  return context;
}
