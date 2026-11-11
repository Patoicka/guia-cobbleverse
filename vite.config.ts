import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativa: el build funciona en GitHub Pages, Netlify, Vercel o abriéndolo desde una carpeta.
export default defineConfig({
  base: './',
  plugins: [react()],
})
