import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import qaDevPlugin from './vite-qa-dev-plugin.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), qaDevPlugin()],
})
