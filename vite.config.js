import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 3000
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
  }
})
