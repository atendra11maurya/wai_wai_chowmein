import { timingSafeEqual } from 'node:crypto'

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8
const loginAttempts = globalThis.__waiWaiEditorLoginAttempts || new Map()
globalThis.__waiWaiEditorLoginAttempts = loginAttempts

function passwordMatches(supplied, expected) {
  if (typeof supplied !== 'string' || typeof expected !== 'string') return false
  const suppliedBuffer = Buffer.from(supplied)
  const expectedBuffer = Buffer.from(expected)
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const editorPassword = process.env.EDITOR_PASSWORD
  if (!editorPassword) return res.status(503).json({ error: 'Editor authentication is not configured.' })

  const clientId = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim()
  const now = Date.now()
  const previous = loginAttempts.get(clientId)
  const attempt = !previous || now - previous.startedAt > ATTEMPT_WINDOW_MS
    ? { count: 0, startedAt: now }
    : previous

  if (attempt.count >= MAX_ATTEMPTS) {
    res.setHeader('Retry-After', String(Math.ceil((ATTEMPT_WINDOW_MS - (now - attempt.startedAt)) / 1000)))
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' })
  }

  if (!passwordMatches(req.body?.password, editorPassword)) {
    attempt.count += 1
    loginAttempts.set(clientId, attempt)
    return res.status(401).json({ error: 'Invalid editor credentials.' })
  }

  loginAttempts.delete(clientId)
  return res.status(200).json({ success: true })
}
