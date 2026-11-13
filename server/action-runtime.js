import { createServer } from 'node:http'
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'

const root = dirname(fileURLToPath(import.meta.url))
const dataDir = join(root, 'data')
const configPath = join(dataDir, 'platform.json')
const distDir = join(root, '..', 'dist')
const port = Number(process.env.PORT || 3001)
const maxBodyBytes = 1024 * 1024
const logLimit = 200

mkdirSync(dataDir, { recursive: true })

function readStore() {
  if (!existsSync(configPath)) return { endpoints: [], requests: [] }
  try {
    const data = JSON.parse(readFileSync(configPath, 'utf8'))
    return { endpoints: Array.isArray(data.endpoints) ? data.endpoints : [], requests: Array.isArray(data.requests) ? data.requests : [] }
  } catch {
    return { endpoints: [], requests: [] }
  }
}

function saveStore(store) {
  const temp = `${configPath}.tmp`
  writeFileSync(temp, JSON.stringify(store, null, 2), { mode: 0o600 })
  renameSync(temp, configPath)
}

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'no-store' })
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', chunk => {
      size += chunk.length
      if (size > maxBodyBytes) {
        reject(Object.assign(new Error('Request body exceeds 1 MB'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) }
      catch { reject(Object.assign(new Error('Request body must be valid JSON'), { status: 400 })) }
    })
    req.on('error', reject)
  })
}

function safeSlug(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{1,47}$/.test(value)
}

function tokenMatches(header, expected) {
  const provided = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : ''
  const actualDigest = createHash('sha256').update(provided).digest()
  const expectedDigest = createHash('sha256').update(expected).digest()
  return timingSafeEqual(actualDigest, expectedDigest) && Boolean(provided)
}

function redact(value, key = '') {
  if (/^(value|updatingValue|password|secret|token)$/i.test(key)) return '[REDACTED]'
  if (Array.isArray(value)) return value.map(item => redact(item))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redact(item, name)]))
  return value
}

function matchesRule(rule, request) {
  if (!rule.enabled) return false
  if (!rule.path) return true
  const value = rule.path.split('.').reduce((current, key) => current?.[key], request)
  return String(value ?? '') === String(rule.equals ?? '')
}

function actionResponse(endpoint, request) {
  const rule = endpoint.rules?.find(candidate => matchesRule(candidate, request))
  const selected = rule || endpoint
  const status = selected.responseMode || 'success'
  const requestId = request.requestId || `req-${randomUUID()}`
  if (status === 'custom') {
    return { httpStatus: Number(selected.httpStatus) || 200, body: { ...(selected.customResponse || {}), requestId } }
  }
  if (status === 'failed') {
    return { httpStatus: 200, body: { actionStatus: 'FAILED', failureReason: selected.failureReason || 'access_denied', failureDescription: selected.failureDescription || 'Request rejected by configured action rule.', requestId } }
  }
  if (status === 'error') {
    return { httpStatus: 500, body: { actionStatus: 'ERROR', errorMessage: selected.errorMessage || 'server_error', errorDescription: selected.errorDescription || 'Configured action error response.', requestId } }
  }
  return { httpStatus: 200, body: { actionStatus: 'SUCCESS', requestId } }
}

function validateEndpoint(endpoint) {
  if (!endpoint || !safeSlug(endpoint.slug)) return 'Endpoint slug must be 2 - 48 characters'
  if (typeof endpoint.name !== 'string' || !endpoint.name.trim()) return 'Endpoint name is required.'
  if (!['PRE_ISSUE_ACCESS_TOKEN', 'PRE_ISSUE_ID_TOKEN', 'PRE_UPDATE_PASSWORD', 'PRE_UPDATE_PROFILE'].includes(endpoint.actionType)) return 'Choose a supported WSO2 action type.'
  if (!['success', 'failed', 'error', 'custom'].includes(endpoint.responseMode)) return 'Choose a valid response mode.'
  if (endpoint.responseMode === 'custom' && (!endpoint.customResponse || typeof endpoint.customResponse !== 'object' || Array.isArray(endpoint.customResponse))) return 'Custom response must be a JSON object.'
  if (endpoint.responseMode === 'custom' && (!Number.isInteger(Number(endpoint.httpStatus)) || Number(endpoint.httpStatus) < 200 || Number(endpoint.httpStatus) > 599)) return 'Custom HTTP status must be between 200 and 599.'
  if (endpoint.rules && (!Array.isArray(endpoint.rules) || endpoint.rules.length > 50)) return 'An endpoint can have up to 50 rules.'
  return null
}

async function handle(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type' })
    res.end()
    return
  }
  let store = readStore()
  if (url.pathname === '/api/health') return json(res, 200, { ok: true, endpoints: store.endpoints.length })
  if (url.pathname.startsWith('/api/')) {
    const remote = req.socket.remoteAddress || ''
    const localRequest = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1'
    const configuredToken = process.env.ACTION_PLATFORM_ADMIN_TOKEN
    if (configuredToken ? req.headers['x-admin-token'] !== configuredToken : !localRequest) {
      return json(res, 401, { error: configuredToken ? 'Admin token required.' : 'Management is available from localhost only. Set ACTION_PLATFORM_ADMIN_TOKEN to manage remotely.' })
    }
  }
  if (url.pathname === '/api/endpoints' && req.method === 'GET') return json(res, 200, { endpoints: store.endpoints })
  if (url.pathname === '/api/requests' && req.method === 'GET') {
    const endpoint = url.searchParams.get('endpoint')
    const entries = endpoint ? store.requests.filter(item => item.endpointSlug === endpoint) : store.requests
    return json(res, 200, { requests: entries })
  }
  if (url.pathname === '/api/requests' && req.method === 'DELETE') {
    const endpoint = url.searchParams.get('endpoint')
    store.requests = endpoint ? store.requests.filter(item => item.endpointSlug !== endpoint) : []
    saveStore(store)
    return json(res, 200, { ok: true })
  }
  if (url.pathname === '/api/endpoints' && req.method === 'POST') {
    let endpoint
    try { endpoint = await readBody(req) } catch (error) { return json(res, error.status || 400, { error: error.message }) }
    const issue = validateEndpoint(endpoint)
    if (issue) return json(res, 400, { error: issue })
    if (store.endpoints.some(item => item.slug === endpoint.slug)) return json(res, 409, { error: 'That endpoint slug is already in use.' })
    const saved = { ...endpoint, endpointKey: randomBytes(32).toString('base64url'), id: randomUUID(), createdAt: new Date().toISOString(), enabled: endpoint.enabled !== false, rules: endpoint.rules || [] }
    store.endpoints.push(saved)
    saveStore(store)
    return json(res, 201, { endpoint: saved })
  }
  const rotateMatch = url.pathname.match(/^\/api\/endpoints\/([a-z0-9-]+)\/rotate-token$/)
  if (rotateMatch && req.method === 'POST') {
    const endpoint = store.endpoints.find(item => item.slug === rotateMatch[1])
    if (!endpoint) return json(res, 404, { error: 'Endpoint not found.' })
    endpoint.endpointKey = randomBytes(32).toString('base64url')
    endpoint.updatedAt = new Date().toISOString()
    saveStore(store)
    return json(res, 200, { endpoint })
  }
  const endpointMatch = url.pathname.match(/^\/api\/endpoints\/([a-z0-9-]+)$/)
  if (endpointMatch && req.method === 'PUT') {
    let endpoint
    try { endpoint = await readBody(req) } catch (error) { return json(res, error.status || 400, { error: error.message }) }
    const issue = validateEndpoint({ ...endpoint, slug: endpointMatch[1] })
    if (issue) return json(res, 400, { error: issue })
    const index = store.endpoints.findIndex(item => item.slug === endpointMatch[1])
    if (index < 0) return json(res, 404, { error: 'Endpoint not found.' })
    store.endpoints[index] = { ...store.endpoints[index], ...endpoint, endpointKey: store.endpoints[index].endpointKey, slug: endpointMatch[1], updatedAt: new Date().toISOString() }
    saveStore(store)
    return json(res, 200, { endpoint: store.endpoints[index] })
  }
  if (endpointMatch && req.method === 'DELETE') {
    if (!store.endpoints.some(item => item.slug === endpointMatch[1])) return json(res, 404, { error: 'Endpoint not found.' })
    store.endpoints = store.endpoints.filter(item => item.slug !== endpointMatch[1])
    store.requests = store.requests.filter(item => item.endpointSlug !== endpointMatch[1])
    saveStore(store)
    return json(res, 200, { ok: true })
  }
  const actionMatch = url.pathname.match(/^\/actions\/([a-z0-9-]+)$/)
  if (actionMatch && req.method === 'POST') {
    const endpoint = store.endpoints.find(item => item.slug === actionMatch[1])
    if (!endpoint || !endpoint.enabled) return json(res, 404, { error: 'Action endpoint not found or disabled.' })
    if (!endpoint.endpointKey || !tokenMatches(req.headers.authorization, endpoint.endpointKey)) return json(res, 401, { error: 'A valid Bearer token is required for this action endpoint.' })
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
      return json(res, 415, { actionStatus: 'ERROR', errorMessage: 'unsupported_media_type', errorDescription: 'Content-Type must be application/json.' })
    }
    const started = Date.now()
    let request
    try { request = await readBody(req) } catch (error) {
      if (error.status === 400) return json(res, 400, { actionStatus: 'ERROR', errorMessage: 'invalid_request', errorDescription: error.message })
      return json(res, error.status || 400, { error: error.message })
    }
    if (request.actionType !== endpoint.actionType || typeof request.event !== 'object' || request.event === null) return json(res, 400, { actionStatus: 'ERROR', errorMessage: 'invalid_request', errorDescription: 'Payload actionType must match this endpoint and include an event object.' })
    const result = actionResponse(endpoint, request)
    const log = { id: randomUUID(), endpointSlug: endpoint.slug, actionType: request.actionType, receivedAt: new Date().toISOString(), durationMs: Date.now() - started, httpStatus: result.httpStatus, actionStatus: result.body.actionStatus || 'CUSTOM', request: redact(request), response: redact(result.body) }
    store.requests.unshift(log)
    store.requests = store.requests.slice(0, logLimit)
    saveStore(store)
    return json(res, result.httpStatus, result.body)
  }
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/actions/')) return json(res, 404, { error: 'Route not found.' })
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed.' })
  const file = normalize(join(distDir, decodeURIComponent(url.pathname === '/' ? 'index.html' : url.pathname.slice(1))))
  if (!(file === distDir || file.startsWith(`${distDir}${sep}`)) || !existsSync(file) || !existsSync(distDir)) return json(res, 404, { error: 'Dashboard build not found. Run npm run build first.' })
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  handle(req, res).catch(error => {
    console.error(error)
    if (!res.headersSent) json(res, 500, { error: 'Internal server error.' })
    else res.destroy()
  })
}).listen(port, '0.0.0.0', () => console.log(`Action platform runtime listening on http://localhost:${port}`))
