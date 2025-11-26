import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  server: {
    port: 5177,
    strictPort: false,
    watch: {
      usePolling: true,
      interval: 100,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
    hmr: {
      overlay: true,
      timeout: 30000,
      protocol: 'ws',
      clientPort: undefined,
    },
    cors: true,
    host: true,
    open: false,
  },
  optimizeDeps: {
    include: ['recharts'],
    force: true,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion') || id.includes('react-hot-toast') || id.includes('react-helmet')) {
              return 'vendor-ui'
            }
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
              return 'vendor-data'
            }
            if (id.includes('@stripe') || id.includes('stripe')) {
              return 'vendor-payment'
            }
            if (id.includes('date-fns')) {
              return 'vendor-utils'
            }
            return 'vendor-other'
          }
          if (id.includes('/pages/admin/') || id.includes('/pages/Admin')) {
            return 'admin'
          }
          if (id.includes('/components/Admin') || id.includes('/components/admin/')) {
            return 'admin-components'
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
