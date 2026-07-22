import { useMemo, useRef, useState, useCallback } from 'react'
import {
  ActionHandlerRequest,
  ActionHandlerResponse,
  FormState,
  buildRequest,
  defaultFormState,
  processRequest,
} from './types'
import ActionHandlerForm, { ActionHandlerFormHandle } from './components/ActionHandlerForm'
import Header from './components/Header'
import JsonEditor, { JsonEditorHandle } from './components/JsonEditor'
import ResponseDisplay from './components/ResponseDisplay'

type Tab = 'form' | 'json'

interface ExamplePreset {
  id: string
  label: string
  description: string
  form: FormState
}

const examples: ExamplePreset[] = [
  {
    id: 'access-token',
    label: 'pre-issue access token action',
    description: 'Access token claims',
    form: defaultFormState,
  },
  {
    id: 'id-token',
    label: 'pre-issue id token action',
    description: 'ID token claims',
    form: {
      ...defaultFormState,
      actionType: 'PRE_ISSUE_ID_TOKEN',
      accessTokenScopes: '',
    },
  },
  {
    id: 'password',
    label: 'pre-update password action',
    description: 'Password update validation',
    form: {
      ...defaultFormState,
      actionType: 'PRE_UPDATE_PASSWORD',
      credentialFormat: 'PLAIN_TEXT',
    },
  },
  {
    id: 'profile',
    label: 'pre-update profile action',
    description: 'Profile attribute updates',
    form: {
      ...defaultFormState,
      actionType: 'PRE_UPDATE_PROFILE',
    },
  },
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('json')
  const [selectedExampleId, setSelectedExampleId] = useState(examples[0].id)
  const [response, setResponse] = useState<ActionHandlerResponse | null>(null)
  const [rawResponse, setRawResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formRef = useRef<ActionHandlerFormHandle>(null)
  const jsonRef = useRef<JsonEditorHandle>(null)

  const selectedExample = useMemo(
    () => examples.find(example => example.id === selectedExampleId) ?? examples[0],
    [selectedExampleId],
  )

  const selectedRequestJson = useMemo(
    () => JSON.stringify(buildRequest(selectedExample.form), null, 2),
    [selectedExample],
  )

  const process = useCallback(async (body: ActionHandlerRequest) => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setRawResponse('')
    await new Promise(resolve => setTimeout(resolve, 220))
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

  const handleRun = useCallback(() => {
    if (loading) {
      return
    }

    if (activeTab === 'form') {
      formRef.current?.submit()
      return
    }

    jsonRef.current?.submit()
  }, [activeTab, loading])

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

  const handleClear = useCallback(() => {
    setResponse(null)
    setRawResponse('')
    setError(null)
  }, [])

  const editorKey = `${selectedExample.id}-${activeTab}`

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-slate-900 transition-colors">
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col">
        <Header />

        <main className="grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="flex flex-col h-full bg-white border-b border-slate-200 xl:border-b-0 xl:border-r">
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Examples</p>
            </div>

            <div className="flex-1 p-2 overflow-auto pro-scrollbar">
              <div className="space-y-1">
                {examples.map(example => {
                  const selected = example.id === selectedExampleId
                  return (
                    <button
                      key={example.id}
                      type="button"
                      onClick={() => {
                        setSelectedExampleId(example.id)
                        setError(null)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                        selected
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h10M7 12h10M7 17h6" />
                      </svg>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{example.label}</span>
                        <span className="block truncate text-[11px] text-slate-400">{example.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
                <button
                  type="button"
                  className="px-2 py-1 text-xs border rounded-md border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={() => setActiveTab(tab => tab === 'form' ? 'json' : 'form')}
                >
                  {activeTab === 'form' ? 'JSON' : 'Form'}
                </button>
              </div>
            </div>
          </aside>

          <section className="grid min-h-0 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
            <div className="flex flex-col min-h-0 bg-white border-b border-slate-200 xl:border-b-0 xl:border-r">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate text-slate-700">{selectedExample.label}</p>
                  <p className="text-xs truncate text-slate-500">Request editor</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 md:inline-flex">
                    {activeTab === 'form' ? 'Form Builder' : 'JSON Editor'}
                  </div>
                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5v14l11-7-11-7z" />
                    </svg>
                    Run
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 p-4 overflow-auto pro-scrollbar">
                {activeTab === 'form' ? (
                  <ActionHandlerForm
                    key={editorKey}
                    ref={formRef}
                    initialForm={selectedExample.form}
                    onSubmit={handleFormSubmit}
                    loading={loading}
                  />
                ) : (
                  <JsonEditor
                    key={editorKey}
                    ref={jsonRef}
                    initialJson={selectedRequestJson}
                    onSubmit={handleJsonSubmit}
                    loading={loading}
                  />
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col bg-[#fafafa]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div>
                  <p className="text-sm font-medium text-slate-700">Output</p>
                  <p className="text-xs text-slate-500">Simulated action handler response</p>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              <div className="flex-1 min-h-0 p-4 overflow-auto pro-scrollbar">
                <ResponseDisplay
                  response={response}
                  rawResponse={rawResponse}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
