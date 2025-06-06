import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
import tailwindcss from 'tailwindcss'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss()
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          
          // Router
          'router': ['react-router-dom'],
          
          // UI libraries
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-progress', 
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          
          // Charts
          'charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          
          // Maps
          'maps': ['leaflet', 'react-leaflet'],
          
          // Animation and UI utilities
          'ui-utils': ['framer-motion', 'lucide-react', 'next-themes'],
          
          // Utility libraries
          'utils': ['lodash', 'date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          
          // File handling
          'file-upload': ['react-dropzone']
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            if (facadeModuleId.includes('dashboard')) {
              return 'assets/dashboard-[name]-[hash].js'
            }
            if (facadeModuleId.includes('components')) {
              return 'assets/components-[name]-[hash].js'
            }
          }
          return 'assets/[name]-[hash].js'
        }
      }
    },
    // Increase chunk size warning limit to 1000kb since we're optimizing
    chunkSizeWarningLimit: 1000
  },
}) 