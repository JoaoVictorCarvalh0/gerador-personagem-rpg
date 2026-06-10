import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/gerar-personagem': 'http://localhost:5000',
      '/status':           'http://localhost:5000',
      '/avatar':           'http://localhost:5000',
      '/login': {
        target: 'http://localhost:5000',
        bypass: (req) => req.method === 'GET' ? req.url : undefined,
      },
      '/register': {
        target: 'http://localhost:5000',
        bypass: (req) => req.method === 'GET' ? req.url : undefined,
      },
      '/personagens': 'http://localhost:5000',
    },
  },
})
