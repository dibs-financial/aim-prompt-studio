// Minimal production server: serves the built client assets and hands
// everything else to the TanStack Start request handler in dist/server.
import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { Readable } from 'node:stream'

const { default: entry } = await import('./dist/server/server.js')

const PORT = Number(process.env.PORT ?? 3000)
const CLIENT_DIR = new URL('./dist/client/', import.meta.url).pathname
const MIME = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
}

function tryStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const filePath = normalize(join(CLIENT_DIR, pathname))
  if (!filePath.startsWith(CLIENT_DIR)) return false
  try {
    const stats = statSync(filePath)
    if (!stats.isFile()) return false
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    if (req.method === 'HEAD') res.end()
    else createReadStream(filePath).pipe(res)
    return true
  } catch {
    return false
  }
}

async function handle(req, res) {
  if (tryStatic(req, res)) return
  const url = new URL(req.url, `http://${req.headers.host ?? `localhost:${PORT}`}`)
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? 'half' : undefined,
  })
  const response = await entry.fetch(request)
  res.writeHead(response.status, Object.fromEntries(response.headers))
  if (response.body) Readable.fromWeb(response.body).pipe(res)
  else res.end()
}

createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error)
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  })
}).listen(PORT, () => {
  console.log(`A.I.M. Prompt Studio listening on http://localhost:${PORT}`)
})
