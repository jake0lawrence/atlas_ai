import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served at jakelawrence.xyz/atlas/ (BASE_PATH in src/routes.js).
export default defineConfig({
  base: '/atlas/',
  plugins: [react()],
})
