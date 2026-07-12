import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { readFileSync, writeFileSync } from 'fs'

const getVersionAndChanges = () => {
  try {
    const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
    let changes: string[] = []
    try {
      const releasesContent = readFileSync(path.resolve(__dirname, 'src/config/releases.ts'), 'utf-8')
      const match = releasesContent.match(/changes:\s*\[([\s\S]*?)\]/)
      if (match) {
        changes = match[1]
          .split(',')
          .map(s => s.trim().replace(/['"]/g, ''))
          .filter(Boolean)
      }
    } catch (e) {
      console.error('Error reading releases.ts', e)
    }
    return { version: pkg.version, changes }
  } catch (e) {
    console.error('Error reading package.json', e)
    return { version: '1.0.0', changes: [] }
  }
}

const { version: appVersion } = getVersionAndChanges()

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      },
      manifest: {
        name: 'Personal OS',
        short_name: 'PersonalOS',
        description: 'A premium, production-ready Personal Operating System foundation.',
        theme_color: '#0F0F10',
        background_color: '#0F0F10',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    }),
    {
      name: 'generate-version-json',
      buildStart() {
        try {
          const data = getVersionAndChanges()
          writeFileSync(path.resolve(__dirname, 'public/version.json'), JSON.stringify(data, null, 2))
          console.log('Successfully generated public/version.json with version', data.version)
        } catch (e) {
          console.error('Failed to generate version.json', e)
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
