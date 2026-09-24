import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    // three.js fica num chunk próprio, carregado sob demanda
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
  },
})
