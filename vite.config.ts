import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Caminho base da aplicacao.
// No GitHub Pages de projeto a URL e https://<usuario>.github.io/<repo>/,
// entao o base precisa ser "/<repo>/". O workflow do GitHub Actions define
// VITE_BASE automaticamente a partir do nome do repositorio.
const base = process.env.VITE_BASE ?? '/utmb-paraty-agenda/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'og.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Agenda Digital Paraty by UTMB',
        short_name: 'Paraty UTMB',
        description: 'Programação, ativações, benefícios e mapa da Expo do Paraty Brazil by UTMB',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000840',
        theme_color: '#070d1c',
        categories: ['sports', 'events'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // CSV publicado do Google Sheets: rede primeiro, cache como rede reserva.
            urlPattern: /^https:\/\/docs\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sheets-csv',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Imagens remotas (logos de marca, regua, mapa da expo).
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'imagens-remotas',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: { target: 'es2020', sourcemap: false },
})
