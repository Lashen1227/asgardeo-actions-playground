import { useState } from 'react'
import { buildRequest, defaultFormState } from '../types'

interface Props {
  onSubmit: (json: string) => void
  loading: boolean
}

const textareaClass = 'w-full h-96 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-y'

export default function JsonEditor({ onSubmit, loading }: Props) {
  const defaultJson = JSON.stringify(buildRequest(defaultFormState), null, 2)
  const [json, setJson] = useState(defaultJson)
  const [error, setError] = useState<string | null>(null)
  const [formatted, setFormatted] = useState(true)

  const handleSubmit = () => {
    try {
      JSON.parse(json)
      setError(null)
      onSubmit(json)
    } catch {
      setError('Invalid JSON — please check syntax before sending.')
    }
  }

  const format = () => {
    try {
      const parsed = JSON.parse(json)
      setJson(JSON.stringify(parsed, null, 2))
      setFormatted(true)
      setError(null)
    } catch {
      setError('Cannot format — JSON is invalid.')
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(json)
      setJson(JSON.stringify(parsed))
      setFormatted(false)
      setError(null)
    } catch {
      setError('Cannot minify — JSON is invalid.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">JSON Editor</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setJson(defaultJson)}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={format}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Format
          </button>
          <button
            type="button"
            onClick={minify}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Minify
          </button>
        </div>
      </div>

      <textarea
        value={json}
        onChange={e => { setJson(e.target.value); setError(null) }}
        className={textareaClass}
        spellCheck={false}
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Processing...
          </span>
        ) : 'Process'}
      </button>
    </div>
  )
}
