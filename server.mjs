import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = Number(process.env.STATIC_PORT || 8080)

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath)
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  })
  createReadStream(filePath).pipe(res)
}

async function resolveFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0] || '/')
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '')
  const requestedPath = path.join(distDir, normalizedPath)

  if (!requestedPath.startsWith(distDir)) {
    return path.join(distDir, 'index.html')
  }

  try {
    const fileStat = await stat(requestedPath)
    if (fileStat.isFile()) {
      return requestedPath
    }
  } catch {
    // SPA fallback below.
  }

  return path.join(distDir, 'index.html')
}

createServer(async (req, res) => {
  try {
    const filePath = await resolveFile(req.url || '/')
    sendFile(res, filePath)
  } catch (error) {
    console.error('Static server error:', error)
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Static server listening on ${port}`)
})
