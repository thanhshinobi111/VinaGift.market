// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'VinaGift', 
  publicDir: 'VinaGift', 
  build: {
    outDir: '../VinaGift', 
    emptyOutDir: false, 
    rollupOptions: {
      input: 'miniapp.html' 
    }
  },
  base: '/' 
});