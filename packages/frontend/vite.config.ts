import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'process.env': env,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.REACT_APP_API_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
