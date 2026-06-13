import { useState } from 'react'
import { ActionHandlerResponse } from '../types'

interface Props {
  response: ActionHandlerResponse | null
  rawResponse: string
  loading: boolean
  error: string | null
}

function copy(text: string) {
  navigator.clipboard.writeText(text)
}

export default function ResponseDisplay({ response, rawResponse, loading, error }: Props) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="h-full">
      <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Server Response</h3>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <p className="text-sm">Processing...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Error</p>
          <pre className="text-xs text-red-600 dark:text-red-300 whitespace-pre-wrap font-mono">{error}</pre>
          {rawResponse && (
            <pre className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/40 text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40 font-mono">
              {rawResponse}
            </pre>
          )}
        </div>
      )}

      {!response && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-sm">Build a request and send it to see the response here.</p>
        </div>
      )}

      {response && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Success
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setExpanded(e => !e)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {expanded ? 'Collapse' : 'Expand'}
              </button>
              <button
                onClick={() => copy(rawResponse)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Copy
              </button>
            </div>
          </div>

          {/* JSON Display */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
              Response JSON
            </div>
            <pre className="p-4 bg-gray-900 text-gray-100 text-xs leading-relaxed overflow-auto max-h-80 font-mono">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          {/* Token Info */}
          {expanded && response.event?.accessToken && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
                Access Token Breakdown
              </div>
              <div className="p-4 space-y-3 bg-white dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-24">Token Type</span>
                  <span className="text-sm font-mono">{response.event.accessToken.tokenType || <span className="text-gray-400 italic">N/A</span>}</span>
                </div>

                {response.event.accessToken.scopes && response.event.accessToken.scopes.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">Scopes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {response.event.accessToken.scopes.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {response.event.accessToken.claims && response.event.accessToken.claims.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">Claims</span>
                    <div className="space-y-1">
                      {response.event.accessToken.claims.map((c, i) => (
                        <div key={i} className="flex gap-2 text-xs font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                          <span className="text-indigo-500 dark:text-indigo-400 font-medium shrink-0">{c.name}:</span>
                          <span className="text-gray-700 dark:text-gray-300 break-all">
                            {Array.isArray(c.value) ? c.value.join(', ') : String(c.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!response.event.accessToken.claims?.length && !response.event.accessToken.scopes?.length && (
                  <p className="text-xs text-gray-400 italic">No claims or scopes in response</p>
                )}

                {response.event.tenant && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Tenant</span>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      {response.event.tenant.id ? `${response.event.tenant.name || '?'} (${response.event.tenant.id})` : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Info */}
          {expanded && response.event.request && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
                Request Info
              </div>
              <div className="p-4 space-y-2 bg-white dark:bg-gray-800/50">
                {response.event.request.clientId && (
                  <div className="flex gap-2 text-xs font-mono">
                    <span className="text-gray-500 w-20 shrink-0">Client ID</span>
                    <span className="text-gray-700 dark:text-gray-300">{response.event.request.clientId}</span>
                  </div>
                )}
                {response.event.request.grantType && (
                  <div className="flex gap-2 text-xs font-mono">
                    <span className="text-gray-500 w-20 shrink-0">Grant Type</span>
                    <span className="text-gray-700 dark:text-gray-300">{response.event.request.grantType}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {response.requestId && (
            <p className="text-xs text-gray-400 font-mono">
              Request ID: {response.requestId}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
