import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['luma-icon.png', 'luma-icon-512.png', 'luma-icon.svg'],
      manifest: {
        name: 'Luma Controller',
        short_name: 'Luma',
        description: 'Smart Wake & Sleep Controller for LED lights',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: '/luma-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/luma-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        start_url: '/',
        orientation: 'portrait'
      }
    })
  ],
  server: {
    host: true, // Make server accessible externally
    port: 3000,
  },
});