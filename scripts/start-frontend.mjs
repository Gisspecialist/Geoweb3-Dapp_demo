const host = process.env.VITE_HOST || '127.0.0.1'
const port = Number(process.env.VITE_PORT || 3000)
const openBrowser = String(process.env.VITE_OPEN || 'true').toLowerCase() !== 'false'

async function startWithVite() {
  const { createServer } = await import('vite')
  const server = await createServer({
    configFile: 'vite.config.js',
    server: {
      host,
      port,
      open: openBrowser,
      strictPort: false,
    },
  })
  await server.listen()
  server.printUrls()
  console.log(`GeoWeb3 frontend is running with Vite. Open http://${host}:${port}`)
}

try {
  await startWithVite()
} catch (error) {
  if (error?.code === 'ERR_MODULE_NOT_FOUND' || String(error?.message || '').includes("Cannot find package 'vite'")) {
    console.log('Vite is not installed in node_modules. Starting the prebuilt frontend instead...')
    await import('./serve-dist.mjs')
  } else {
    console.error('Failed to start GeoWeb3 frontend:')
    console.error(error)
    process.exit(1)
  }
}
