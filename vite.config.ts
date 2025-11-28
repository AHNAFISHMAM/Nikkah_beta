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
    // Enable minification
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React core - must load first
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react'
            }
            // React Router
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            // Charts - separate heavy chunk
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            // Framer Motion - used less now
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            // UI utilities
            if (id.includes('react-hot-toast') || id.includes('react-helmet') || id.includes('lucide-react')) {
              return 'vendor-ui'
            }
            // Data layer
            if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
              return 'vendor-data'
            }
            // Payment
            if (id.includes('@stripe') || id.includes('stripe')) {
              return 'vendor-payment'
            }
            // Utilities
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils'
            }
            // PDF generation - load on demand
            if (id.includes('html2canvas') || id.includes('jspdf')) {
              return 'vendor-pdf'
            }
            return 'vendor-other'
          }
          // Admin pages
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
    // CSS optimization
    cssCodeSplit: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
  },
})
