import http from 'http'
import { URL } from 'url'

http
  .createServer((req, res) => {
    if (!req.url) return

    const url = new URL(req.url, `http://${req.headers.host}`)

    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ foo: 'bar' }))
    }
  })
  .listen(3000, () => {
    console.log('Server running at http://localhost:3000')
  })
