import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const host = process.env.VITE_HOST || '127.0.0.1'
const port = Number(process.env.VITE_PORT || 3000)

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
}

if (!fs.existsSync(distDir)) {
  console.error(`Cannot find the built frontend at: ${distDir}`)
  console.error('Run npm install and npm run build first, or use the ZIP package that includes the dist folder.')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${host}:${port}`)
    let requestedPath = decodeURIComponent(url.pathname)
    if (requestedPath === '/') requestedPath = '/index.html'

    let filePath = path.normalize(path.join(distDir, requestedPath))
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html')
    }

    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    })
    fs.createReadStream(filePath).pipe(res)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(String(error?.stack || error))
  }
})

server.listen(port, host, () => {
  console.log(`GeoWeb3 frontend is running from the prebuilt dist folder.`)
  console.log(`Open: http://${host}:${port}`)
  console.log('Note: this fallback server does not require Vite or node_modules.')
})
