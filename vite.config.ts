import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'JaycarSort',
        short_name: 'JaycarSort',
        icons: [
          {
            src: '/JaycarSort/turbine.jpg',
            sizes: '200x200',
            type: 'image/jpg',
          },
        ],
        theme_color: '#ffffff',
        background_color: '#0c254c',
        display: 'standalone',
      },
    }),
  ],
});
