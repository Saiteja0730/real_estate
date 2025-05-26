import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/auth':{
        target: 'https://real-estate-nhro.onrender.com',
        secure:false,
      },
    },
  },
  plugins: [react()],
})
