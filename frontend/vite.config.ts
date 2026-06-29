import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/config': 'http://localhost:8000',
      '/tests': 'http://localhost:8000',
      '/run': 'http://localhost:8000',
      '/status': 'http://localhost:8000',
      '/stop': 'http://localhost:8000',
    }
  }
})