import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Courier Cue',
        short_name: 'CourierCue',
        description: 'Delivery management application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/courier-cue/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000'),
    'import.meta.env.VITE_USER_POOL_ID': JSON.stringify(process.env.VITE_USER_POOL_ID || ''),
    'import.meta.env.VITE_USER_POOL_CLIENT_ID': JSON.stringify(process.env.VITE_USER_POOL_CLIENT_ID || ''),
    'import.meta.env.VITE_USER_POOL_DOMAIN': JSON.stringify(process.env.VITE_USER_POOL_DOMAIN || ''),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
    'import.meta.env.VITE_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
})
