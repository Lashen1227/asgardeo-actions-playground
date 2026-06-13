import { useState, useCallback } from 'react'
import { ActionHandlerRequest, ActionHandlerResponse, processRequest } from './types'
import ActionHandlerForm from './components/ActionHandlerForm'
import JsonEditor from './components/JsonEditor'
import ResponseDisplay from './components/ResponseDisplay'

type Tab = 'form' | 'json'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('form')
  const [response, setResponse] = useState<ActionHandlerResponse | null>(null)
  const [rawResponse, setRawResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(true)

  const process = useCallback(async (body: ActionHandlerRequest) => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setRawResponse('')
    await new Promise(r => setTimeout(r, 300))
    try {
      const result = processRequest(body)
      const json = JSON.stringify(result, null, 2)
      setRawResponse(json)
      setResponse(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleFormSubmit = useCallback((data: ActionHandlerRequest) => {
    process(data)
  }, [process])

  const handleJsonSubmit = useCallback((json: string) => {
    try {
      const data: ActionHandlerRequest = JSON.parse(json)
      process(data)
    } catch {
      setError('Invalid JSON payload')
    }
  }, [process])

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Asgardeo Actions Playground</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Test and explore action handler payloads</p>
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title="Toggle dark mode"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition
                ${activeTab === 'form'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-b-0 border-gray-200 dark:border-gray-700 -mb-px'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Form Builder
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition
                ${activeTab === 'json'
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-b-0 border-gray-200 dark:border-gray-700 -mb-px'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              JSON Editor
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              {activeTab === 'form' ? (
                <ActionHandlerForm onSubmit={handleFormSubmit} loading={loading} />
              ) : (
                <JsonEditor onSubmit={handleJsonSubmit} loading={loading} />
              )}
            </div>

            <div>
              <ResponseDisplay
                response={response}
                rawResponse={rawResponse}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
