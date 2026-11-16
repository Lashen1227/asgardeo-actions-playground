import { useCallback, useEffect, useMemo, useState } from 'react'

type ActionType = 'PRE_ISSUE_ACCESS_TOKEN' | 'PRE_ISSUE_ID_TOKEN' | 'PRE_UPDATE_PASSWORD' | 'PRE_UPDATE_PROFILE'
type ResponseMode = 'success' | 'failed' | 'error' | 'custom'

interface Rule {
  id: string
  name: string
  enabled: boolean
  path: string
  equals: string
  responseMode: ResponseMode
  failureReason: string
  failureDescription: string
  errorMessage: string
  errorDescription: string
  customResponse?: Record<string, unknown>
}

interface Endpoint {
  id?: string
  endpointKey?: string
  slug: string
  name: string
  actionType: ActionType
  enabled: boolean
  responseMode: ResponseMode
  failureReason: string
  failureDescription: string
  errorMessage: string
  errorDescription: string
  customResponse: Record<string, unknown>
  httpStatus: number
  rules: Rule[]
  createdAt?: string
}

interface RequestLog {
  id: string
  endpointSlug: string
  actionType: string
  receivedAt: string
  durationMs: number
  httpStatus: number
  actionStatus: string
  request: unknown
  response: unknown
}

interface Props {
  onBackToPlayground: () => void
}

const actionTypes: ActionType[] = ['PRE_ISSUE_ACCESS_TOKEN', 'PRE_ISSUE_ID_TOKEN', 'PRE_UPDATE_PASSWORD', 'PRE_UPDATE_PROFILE']
const initialForm = (): Endpoint => ({ slug: '', name: '', actionType: actionTypes[0], enabled: true, responseMode: 'success', failureReason: 'access_denied', failureDescription: 'Request rejected by configured action rule.', errorMessage: 'server_error', errorDescription: 'Configured action error response.', customResponse: { actionStatus: 'SUCCESS' }, httpStatus: 200, rules: [] })
const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
const labelClass = 'mb-1 block text-xs font-medium text-slate-500'
const buttonClass = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'
const pretty = (value: unknown) => JSON.stringify(value, null, 2)

function blankRule(): Rule {
  return { id: crypto.randomUUID(), name: 'New rule', enabled: true, path: '', equals: '', responseMode: 'failed', failureReason: 'access_denied', failureDescription: 'Request rejected by this rule.', errorMessage: 'server_error', errorDescription: 'Configured action error response.' }
}

function endpointUrl(slug: string) {
  return `${window.location.origin}/actions/${slug}`
}

export default function PlatformDashboard({ onBackToPlayground }: Props) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [draft, setDraft] = useState<Endpoint | null>(null)
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [customText, setCustomText] = useState('')
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('action-platform-admin-token') || '')
  const [logQuery, setLogQuery] = useState('')

  const apiFetch = useCallback((input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    if (adminToken) headers.set('x-admin-token', adminToken)
    return fetch(input, { ...init, headers })
  }, [adminToken])

  const refresh = useCallback(async () => {
    try {
      const [endpointResponse, requestResponse] = await Promise.all([apiFetch('/api/endpoints'), apiFetch('/api/requests')])
      const endpointData = await endpointResponse.json()
      const requestData = await requestResponse.json()
      if (!endpointResponse.ok || !requestResponse.ok) throw new Error(endpointData.error || requestData.error || 'Could not load the action platform.')
      setEndpoints(endpointData.endpoints || [])
      setLogs(requestData.requests || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The action runtime is not reachable. Start it with npm run dev.')
    }
  }, [apiFetch])

  useEffect(() => { void refresh() }, [refresh])

  const selectedEndpoint = useMemo(() => endpoints.find(item => item.slug === selectedSlug) || null, [endpoints, selectedSlug])

  const openNew = () => {
    setSelectedSlug(null)
    setDraft(initialForm())
    setCustomText(pretty({ actionStatus: 'SUCCESS' }))
    setError('')
  }

  const openEdit = (endpoint: Endpoint) => {
    setSelectedSlug(endpoint.slug)
    setDraft(JSON.parse(JSON.stringify(endpoint)) as Endpoint)
    setCustomText(pretty(endpoint.customResponse || { actionStatus: 'SUCCESS' }))
    setError('')
  }

  const updateDraft = <K extends keyof Endpoint>(key: K, value: Endpoint[K]) => setDraft(current => current ? { ...current, [key]: value } : current)

  const save = async () => {
    if (!draft) return
    setBusy(true)
    setError('')
    let customResponse: Record<string, unknown>
    try { customResponse = draft.responseMode === 'custom' ? JSON.parse(customText) as Record<string, unknown> : draft.customResponse }
    catch { setError('Custom response must be valid JSON.'); setBusy(false); return }
    const payload = { ...draft, customResponse }
    try {
      const response = await apiFetch(draft.id ? `/api/endpoints/${encodeURIComponent(draft.slug)}` : '/api/endpoints', { method: draft.id ? 'PUT' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save endpoint.')
      setNotice('Endpoint saved.')
      setDraft(null)
      setSelectedSlug(data.endpoint.slug)
      await refresh()
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not save endpoint.') }
    finally { setBusy(false) }
  }

  const deleteEndpoint = async (endpoint: Endpoint) => {
    if (!window.confirm(`Delete “${endpoint.name}” and its request history?`)) return
    const response = await apiFetch(`/api/endpoints/${encodeURIComponent(endpoint.slug)}`, { method: 'DELETE' })
    if (!response.ok) { setError('Could not delete endpoint.'); return }
    setDraft(null); setSelectedSlug(null); setNotice('Endpoint deleted.'); await refresh()
  }

  const rotateEndpointToken = async (endpoint: Endpoint) => {
    if (!window.confirm(`Rotate the Bearer token for “${endpoint.name}”? The current token will stop working.`)) return
    const response = await apiFetch(`/api/endpoints/${encodeURIComponent(endpoint.slug)}/rotate-token`, { method: 'POST' })
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Could not rotate endpoint token.'); return }
    setNotice('Bearer token rotated. Update the WSO2 action authentication settings.')
    await refresh()
  }

  const clearLogs = async () => {
    const response = await apiFetch(selectedSlug ? `/api/requests?endpoint=${encodeURIComponent(selectedSlug)}` : '/api/requests', { method: 'DELETE' })
    if (response.ok) { setSelectedLog(null); setNotice('Request history cleared.'); await refresh() }
  }

  const testEndpoint = async (endpoint: Endpoint) => {
    setBusy(true); setError('')
    try {
      const response = await fetch(`/actions/${encodeURIComponent(endpoint.slug)}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${endpoint.endpointKey}` }, body: JSON.stringify({ actionType: endpoint.actionType, requestId: `playground-${Date.now()}`, event: { tenant: { name: 'demo' }, request: { clientId: 'playground-client' } } }) })
      const body = await response.json()
      setNotice(`Test request returned HTTP ${response.status} / ${body.actionStatus || 'CUSTOM'}.`)
      await refresh()
    } catch { setError('The endpoint test request failed.') }
    finally { setBusy(false) }
  }

  const visibleLogs = (selectedSlug ? logs.filter(log => log.endpointSlug === selectedSlug) : logs)
    .filter(log => `${log.endpointSlug} ${log.actionType} ${log.actionStatus} ${log.id}`.toLowerCase().includes(logQuery.toLowerCase()))

  const exportLogs = () => {
    const file = new Blob([pretty(visibleLogs)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `action-requests-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-slate-900">
      <header className="sticky top-0 z-10 px-4 py-3 border-b border-slate-200 bg-white/95 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div><h1 className="text-sm font-semibold">Action Platform</h1><p className="text-xs text-slate-500">Configure and inspect WSO2 action endpoints</p></div>
            </div>
          <div className="flex flex-wrap items-center gap-2"><input className="w-48 px-2 py-2 text-xs border rounded-lg border-slate-200" type="password" placeholder="Admin token (remote only)" value={adminToken} onChange={e => { setAdminToken(e.target.value); sessionStorage.setItem('action-platform-admin-token', e.target.value) }} aria-label="Admin token" /><button className={buttonClass} onClick={onBackToPlayground}>Payload playground</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
        <div className="px-4 py-3 text-xs leading-relaxed border rounded-xl border-amber-200 bg-amber-50 text-amber-900"><strong>Protect your deployment:</strong> each endpoint requires its generated Bearer token. Request logs are stored in <code>server/data/platform.json</code>; values named <code>value</code> and <code>updatingValue</code> are redacted. Configure the token in WSO2&apos;s endpoint authentication and use HTTPS. The dashboard has one shared admin token, not user accounts or multi-tenant isolation.</div>
        {(error || notice) && <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{error || notice}<button className="float-right" onClick={() => { setError(''); setNotice('') }}>×</button></div>}
        <section className="grid gap-4 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.6fr)]">
          <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200"><div><h2 className="text-sm font-semibold">Action endpoints</h2><p className="text-xs text-slate-500">{endpoints.length} configured</p></div><button className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700" onClick={openNew}>+ New endpoint</button></div>
            <div className="max-h-[34rem] space-y-2 overflow-auto p-3">
              {endpoints.length === 0 && <div className="p-6 text-center border border-dashed rounded-lg border-slate-300"><p className="text-sm font-medium">No endpoints yet</p><p className="mt-1 text-xs text-slate-500">Create one to get a URL you can configure in WSO2.</p></div>}
              {endpoints.map(endpoint => <button key={endpoint.slug} onClick={() => { setDraft(null); setSelectedSlug(endpoint.slug); setError('') }} className={`w-full rounded-lg border p-3 text-left transition ${selectedSlug === endpoint.slug ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium truncate">{endpoint.name}</span><span className={`h-2 w-2 shrink-0 rounded-full ${endpoint.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} /></div><span className="mt-1 block text-[11px] text-slate-500">{endpoint.actionType}</span><span className="mt-2 block truncate font-mono text-[11px] text-indigo-700">/actions/{endpoint.slug}</span></button>)}
            </div>
          </div>
          <div className="min-w-0 bg-white border rounded-xl border-slate-200">
            {draft ? <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-5"><div><h2 className="text-base font-semibold">{draft.id ? 'Endpoint settings' : 'Create action endpoint'}</h2><p className="mt-1 text-xs text-slate-500">Select how this URL responds to WSO2 action requests.</p></div><button className={buttonClass} onClick={() => setDraft(null)}>Close</button></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className={labelClass}>Endpoint name</span><input className={inputClass} value={draft.name} placeholder="Token policy" onChange={e => updateDraft('name', e.target.value)} /></label>
                <label><span className={labelClass}>URL slug</span><input className={inputClass} value={draft.slug} placeholder="token-policy" disabled={Boolean(draft.id)} onChange={e => updateDraft('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} /><span className="mt-1 block text-[10px] text-slate-400"> 2 - 48 characters.</span></label>
                <label><span className={labelClass}>WSO2 action type</span><select className={inputClass} value={draft.actionType} onChange={e => updateDraft('actionType', e.target.value as ActionType)}>{actionTypes.map(action => <option key={action}>{action}</option>)}</select></label>
                <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={draft.enabled} onChange={e => updateDraft('enabled', e.target.checked)} /> Endpoint is enabled</label>
              </div>
              <div className="p-3 mt-5 rounded-lg bg-slate-50"><span className={labelClass}>Public action URL</span><code className="text-xs text-indigo-700 break-all">{draft.slug ? endpointUrl(draft.slug) : 'Choose a slug to generate the endpoint URL'}</code></div>
              <div className="grid gap-4 mt-5 sm:grid-cols-2">
                <label>
                    <span className={labelClass}>Default response behavior</span>
                  <select className={inputClass} value={draft.responseMode} onChange={e => updateDraft('responseMode', e.target.value as ResponseMode)}>
                  <option value="success">Allow - SUCCESS</option>
                  <option value="failed">Reject - FAILED (HTTP 200)</option>
                  <option value="error">Processing error - ERROR (HTTP 500)</option>
                  <option value="custom">Custom JSON response</option></select>
                </label>
                {draft.responseMode === 'failed' && <><label><span className={labelClass}>Failure reason</span><input className={inputClass} value={draft.failureReason} onChange={e => updateDraft('failureReason', e.target.value)} /></label><label className="sm:col-span-2"><span className={labelClass}>Failure description</span><textarea className={inputClass} rows={2} value={draft.failureDescription} onChange={e => updateDraft('failureDescription', e.target.value)} /></label></>}
                {draft.responseMode === 'error' && <><label><span className={labelClass}>Error message</span><input className={inputClass} value={draft.errorMessage} onChange={e => updateDraft('errorMessage', e.target.value)} /></label><label className="sm:col-span-2"><span className={labelClass}>Error description</span><textarea className={inputClass} rows={2} value={draft.errorDescription} onChange={e => updateDraft('errorDescription', e.target.value)} /></label></>}
                {draft.responseMode === 'custom' && <><label><span className={labelClass}>HTTP status</span><input className={inputClass} type="number" min={200} max={599} value={draft.httpStatus} onChange={e => updateDraft('httpStatus', Number(e.target.value))} /></label><label className="sm:col-span-2"><span className={labelClass}>Response JSON object</span><textarea className={`${inputClass} font-mono text-xs`} rows={8} value={customText} onChange={e => setCustomText(e.target.value)} /></label></>}
              </div>
              <div className="pt-5 mt-6 border-t border-slate-200"><div className="flex items-center justify-between mb-3"><div><h3 className="text-sm font-semibold">Conditional rules</h3><p className="mt-1 text-xs text-slate-500">Rules are checked top to bottom. First matching rule overrides the default response.</p></div><button className={buttonClass} onClick={() => updateDraft('rules', [...draft.rules, blankRule()])}>+ Add rule</button></div>
                <div className="space-y-3">{draft.rules.map((rule, index) => <div key={rule.id} className="p-3 border rounded-lg border-slate-200"><div className="flex items-center gap-2 mb-3"><input className={`${inputClass} max-w-xs`} value={rule.name} onChange={e => updateDraft('rules', draft.rules.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} /><label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" checked={rule.enabled} onChange={e => updateDraft('rules', draft.rules.map((item, i) => i === index ? { ...item, enabled: e.target.checked } : item))} />Enabled</label><button className="ml-auto text-xs text-red-600" onClick={() => updateDraft('rules', draft.rules.filter((_, i) => i !== index))}>Remove</button></div><div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr]"><label><span className={labelClass}>Request field (dot path)</span><input className={inputClass} placeholder="event.request.grantType" value={rule.path} onChange={e => updateDraft('rules', draft.rules.map((item, i) => i === index ? { ...item, path: e.target.value } : item))} /></label><label><span className={labelClass}>Equals</span><input className={inputClass} placeholder="client_credentials" value={rule.equals} onChange={e => updateDraft('rules', draft.rules.map((item, i) => i === index ? { ...item, equals: e.target.value } : item))} /></label><label><span className={labelClass}>Behavior</span><select className={inputClass} value={rule.responseMode} onChange={e => updateDraft('rules', draft.rules.map((item, i) => i === index ? { ...item, responseMode: e.target.value as ResponseMode } : item))}><option value="success">SUCCESS</option><option value="failed">FAILED</option><option value="error">ERROR</option></select></label></div>{!rule.path && <p className="mt-2 text-[11px] text-amber-700">Set a field path to make this rule conditional.</p>}</div>)}</div>
              </div>
              {error && <p className="p-3 mt-4 text-sm text-red-700 rounded-lg bg-red-50">{error}</p>}
              <div className="flex flex-wrap justify-between gap-2 mt-6"><div className="flex gap-1">{draft.id && <><button className="px-3 py-2 text-xs text-slate-600 rounded-lg hover:bg-slate-100" onClick={() => void rotateEndpointToken(draft)}>Rotate token</button><button className="px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50" onClick={() => void deleteEndpoint(draft)}>Delete endpoint</button></>}</div><div className="flex gap-2"><button className={buttonClass} onClick={() => void testEndpoint(draft)} disabled={!draft.id || busy}>Send test request</button><button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save endpoint'}</button></div></div>
            </div> : selectedEndpoint ? <div className="p-4 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="text-base font-semibold">{selectedEndpoint.name}</h2><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${selectedEndpoint.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{selectedEndpoint.enabled ? 'Enabled' : 'Disabled'}</span></div><p className="mt-1 text-xs text-slate-500">{selectedEndpoint.actionType}</p></div><div className="flex gap-2"><button className={buttonClass} disabled={busy} onClick={() => void testEndpoint(selectedEndpoint)}>Send test request</button><button className={buttonClass} onClick={() => openEdit(selectedEndpoint)}>Configure</button></div></div><div className="flex flex-wrap items-center gap-3 p-3 mt-4 rounded-lg bg-slate-50"><code className="flex-1 min-w-0 text-xs text-indigo-700 break-all">{endpointUrl(selectedEndpoint.slug)}</code><button className={buttonClass} onClick={() => void navigator.clipboard.writeText(endpointUrl(selectedEndpoint.slug)).then(() => setNotice('Endpoint URL copied.'))}>Copy URL</button></div><div className="flex flex-wrap items-center gap-2 mt-3"><span className="text-xs text-slate-500">Bearer token</span><code className="max-w-full break-all rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700">{selectedEndpoint.endpointKey}</code><button className={buttonClass} onClick={() => void navigator.clipboard.writeText(selectedEndpoint.endpointKey || '').then(() => setNotice('Bearer token copied.'))}>Copy token</button></div><p className="mt-3 text-xs text-slate-500">Configure this endpoint URL and Bearer token in WSO2. Default behavior: <strong className="text-slate-700">{selectedEndpoint.responseMode.toUpperCase()}</strong> · {selectedEndpoint.rules.length} rules · {logs.filter(log => log.endpointSlug === selectedSlug).length} recent requests</p></div> : <div className="flex flex-col items-center justify-center p-8 text-center min-h-64"><div className="flex items-center justify-center mb-3 text-xl text-indigo-600 rounded-full h-11 w-11 bg-indigo-50">↗</div><h2 className="text-sm font-semibold">Your action service workspace</h2><p className="max-w-sm mt-1 text-xs leading-relaxed text-slate-500">Create an endpoint to receive real POST requests from WSO2. Configure success, rejection, error, or conditional behavior.</p><button className="px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-lg" onClick={openNew}>Create an endpoint</button></div>}
          </div>
        </section>
        <section className="overflow-hidden bg-white border rounded-xl border-slate-200"><div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200"><div><h2 className="text-sm font-semibold">Request history</h2><p className="text-xs text-slate-500">Most recent {visibleLogs.length} of up to 200 requests · sensitive values redacted</p></div><div className="flex flex-wrap gap-2"><input className="w-44 rounded-lg border border-slate-200 px-2 py-2 text-xs" placeholder="Filter requests" value={logQuery} onChange={e => setLogQuery(e.target.value)} aria-label="Filter request history" /><button className={buttonClass} onClick={() => void refresh()}>Refresh</button><button className={buttonClass} onClick={exportLogs} disabled={!visibleLogs.length}>Export JSON</button><button className={buttonClass} onClick={() => void clearLogs()} disabled={!visibleLogs.length}>Clear history</button></div></div>{visibleLogs.length ? <div className="grid min-h-60 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.5fr)]"><div className="max-h-[30rem] divide-y divide-slate-100 overflow-auto">{visibleLogs.map(log => <button key={log.id} className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${selectedLog?.id === log.id ? 'bg-indigo-50' : ''}`} onClick={() => setSelectedLog(log)}><div className="flex items-center justify-between"><span className="text-xs font-semibold">{log.endpointSlug}</span><span className={`text-[10px] font-semibold ${log.actionStatus === 'SUCCESS' ? 'text-emerald-700' : 'text-amber-700'}`}>{log.actionStatus}</span></div><p className="mt-1 truncate text-[10px] text-slate-500">{new Date(log.receivedAt).toLocaleString()} · HTTP {log.httpStatus} · {log.durationMs} ms</p></button>)}</div><div className="min-w-0 p-4 border-t border-slate-200 lg:border-l lg:border-t-0">{selectedLog ? <div className="grid gap-4 md:grid-cols-2"><div><p className="mb-2 text-xs font-semibold">Incoming request <span className="font-normal text-slate-400">(redacted)</span></p><pre className="max-h-[25rem] overflow-auto rounded-lg bg-slate-950 p-3 text-[10px] leading-relaxed text-slate-100">{pretty(selectedLog.request)}</pre></div><div><p className="mb-2 text-xs font-semibold">Action response</p><pre className="max-h-[25rem] overflow-auto rounded-lg bg-slate-950 p-3 text-[10px] leading-relaxed text-slate-100">{pretty(selectedLog.response)}</pre></div></div> : <p className="py-10 text-xs text-center text-slate-400">Choose a request to inspect its redacted payload and response.</p>}</div></div> : <p className="px-4 py-10 text-xs text-center text-slate-400">No requests captured yet. Send a test request or connect this endpoint in WSO2.</p>}</section>
      </main>
    </div>
  )
}
