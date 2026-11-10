/**
 * Why this exists: Vite build and dev-server settings, with the Tailwind v4 plugin.
 * Started from the Vite React template (third-party).
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 uses a Vite plugin instead of PostCSS
  ],
  server: {
    port: 5173,
  },
})
