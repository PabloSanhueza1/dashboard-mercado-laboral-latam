import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: 'https://pablosanhueza1.github.io/dashboard-mercado-laboral-latam',
})