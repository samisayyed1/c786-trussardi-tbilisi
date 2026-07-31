import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  /**
   * Deployment base path. '/' for a domain root; GitHub Pages project sites are
   * served from '/<repo>/', so the workflow sets VITE_BASE accordingly.
   * Runtime-built asset paths go through `src/lib/asset.ts`, which reads the
   * same value via import.meta.env.BASE_URL.
   */
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Keep GSAP out of the entry chunk so the hero markup can paint
        // before the animation library finishes parsing.
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
