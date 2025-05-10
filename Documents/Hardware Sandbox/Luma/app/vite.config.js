import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'luma-icon.png', 
        'luma-icon-512.png', 
        'apple-touch-icon.png',
        'luma-icon.svg',
        'luma_logo.png'
      ],
      manifest: {
        name: 'Luma Controller',
        short_name: 'Luma',
        description: 'Smart Wake & Sleep Controller for LED lights',
        theme_color: '#121212',
        background_color: '#0a0a0a',
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
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any maskable'
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
  // Ensure proper base path for production builds
  base: '/',
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Generate source maps for easier debugging
    sourcemap: true,
    // Optimize chunks for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-colorful', 'axios'],
        }
      }
    }
  }
});