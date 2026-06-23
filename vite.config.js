import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: troca 'dashboard-bebe' pelo nome exato do teu repositório no GitHub
export default defineConfig({
  plugins: [react()],
  base: '/dashboard-bebe/',
})
