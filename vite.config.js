import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
      if (body.length > 3 * 1024 * 1024) reject(new Error('Request is too large.'))
    })
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')) } catch (error) { reject(error) }
    })
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function localEditorApi(editorPassword) {
  return {
    name: 'local-editor-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const isLogin = req.url === '/api/login' && req.method === 'POST'
        const isSave = req.url === '/api/save' && req.method === 'POST'
        if (!isLogin && !isSave) return next()

        if (!editorPassword) return sendJson(res, 503, { error: 'Set EDITOR_PASSWORD in .env.local to use the local editor.' })

        try {
          const data = await readJsonBody(req)
          if (isLogin) {
            return data.password === editorPassword
              ? sendJson(res, 200, { success: true })
              : sendJson(res, 401, { error: 'Invalid editor credentials.' })
          }

          if (req.headers['x-editor-password'] !== editorPassword) {
            return sendJson(res, 401, { error: 'Unauthorized.' })
          }
          if (!data.personal || typeof data.personal !== 'object') {
            return sendJson(res, 400, { error: 'Invalid portfolio data.' })
          }

          delete data.personal.adminPassword
          const targetPath = path.resolve(process.cwd(), 'src/config/portfolioData.json')
          fs.writeFileSync(targetPath, JSON.stringify(data, null, 2))
          return sendJson(res, 200, { success: true, message: 'Saved locally. Commit and push when ready.' })
        } catch (error) {
          return sendJson(res, 400, { error: error.message })
        }
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localEditorApi(env.EDITOR_PASSWORD)]
  }
})
