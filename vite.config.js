import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,
    strictPort: true,
    open: true
  },

  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'r3f-core': ['@react-three/fiber'],
          'drei': ['@react-three/drei'],
          'postprocessing': ['@react-three/postprocessing', 'postprocessing'],
          'framer': ['framer-motion'],
          'gsap': ['gsap'],
          'lenis': ['lenis'],
          'styled': ['styled-components'],
        }
      }
    }
  },

  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      'gsap',
      'lenis',
    ],
    exclude: [
      '@mediapipe/tasks-vision',
    ]
  },
})