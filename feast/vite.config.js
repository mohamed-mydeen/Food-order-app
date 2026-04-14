import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      /* Pre-cache all critical assets so install is instant */
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],
      manifest: {
        name: 'Feast At Night',
        short_name: 'Feast At Night',
        description: 'Food Ordering App — Authentic Mandi & Fresh Juices delivered to your door.',
        theme_color: '#a83100',      // matches brand orange
        background_color: '#ffffff', // white splash → faster perceived load
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['food', 'lifestyle', 'shopping'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        /* ── Aggressive pre-caching for instant PWA load ───────────── */
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],

        /* Skip old SW waiting so new version activates immediately */
        skipWaiting: true,
        clientsClaim: true,

        /* ── Runtime caching strategies ───────────────────────────── */
        runtimeCaching: [
          /* API – network-first; serves stale if offline */
          {
            urlPattern: /\/api\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'fan-api-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 6,  // faster fallback (was 10)
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          /* Google Fonts CSS */
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          /* Google Fonts files */
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          /* Cloudinary & external images – cache aggressively */
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          /* Other external images (Google, etc.) */
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fan-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          /* JS/CSS – stale-while-revalidate for instant load */
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'fan-static' },
          },
          /* Material Symbols icon font */
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/css2\?family=Material/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'material-icons',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // enable only when testing PWA locally
      },
    }),
  ],

  /* ── Build optimisation: faster chunk loading ─────────────────────── */
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
