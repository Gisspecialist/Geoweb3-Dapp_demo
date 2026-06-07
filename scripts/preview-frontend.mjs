import { preview } from 'vite'

const host = process.env.VITE_HOST || '127.0.0.1'
const port = Number(process.env.VITE_PREVIEW_PORT || 4173)

try {
  const server = await preview({
    configFile: 'vite.config.js',
    preview: {
      host,
      port,
      open: true,
      strictPort: false,
    },
  })
  server.printUrls()
} catch (error) {
  console.error('Failed to start GeoWeb3 preview:')
  console.error(error)
  process.exit(1)
}
