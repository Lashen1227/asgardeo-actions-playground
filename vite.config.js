import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { runtimePort } from './server/config.js'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      '/api': `http://127.0.0.1:${runtimePort}`,
      '/actions': `http://127.0.0.1:${runtimePort}`,
    },
  }
})
