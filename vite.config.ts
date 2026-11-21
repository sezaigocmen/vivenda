import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import os from 'node:os'

const PORT = 5176

/** Yerel ağ adresi: geliştirme sırasında QR kod bununla iPhone'dan açılır. */
function lanUrl() {
  const all = Object.values(os.networkInterfaces()).flat().filter(Boolean) as os.NetworkInterfaceInfo[]
  const v4 = all.filter((i) => i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.254'))
  const pick = v4.find((i) => i.address.startsWith('192.168.')) ?? v4.find((i) => i.address.startsWith('10.')) ?? v4[0]
  return pick ? `http://${pick.address}:${PORT}` : ''
}

export default defineConfig({
  server: { port: PORT, strictPort: true, host: true },
  build: { chunkSizeWarningLimit: 800 },
  define: { __LAN_URL__: JSON.stringify(lanUrl()) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Vivenda – Shop Local',
        short_name: 'Vivenda',
        description: 'Rediscover your neighborhood: local shops, their stories and community events in one app.',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        background_color: '#FFFFFF',
        theme_color: '#FFFFFF',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff2}'], globIgnores: ['splash/**'] },
    }),
  ],
})
