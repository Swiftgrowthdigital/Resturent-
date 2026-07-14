import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const restaurantName = '';
  if (mode === 'production' && String(env.VITE_USE_DEMO_DATA).toLowerCase() === 'true') {
    throw new Error('VITE_USE_DEMO_DATA=true is forbidden in production builds.');
  }

  return {
  build: {
    chunkSizeWarningLimit: 700
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: restaurantName,
        short_name: restaurantName,
        description: `Scan, order, and track ${restaurantName} orders.`,
        start_url: '/menu',
        scope: '/',
        display: 'standalone',
        theme_color: '#f97316',
        background_color: '#0f172a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /\.[^/]+$/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//,
            handler: 'CacheFirst',
            options: { cacheName: 'menu-images', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ],
  server: { host: '0.0.0.0' }
  };
});
