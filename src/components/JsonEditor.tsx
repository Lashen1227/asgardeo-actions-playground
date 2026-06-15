import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { buildRequest, defaultFormState } from '../types'

interface Props {
  onSubmit: (json: string) => void
  loading: boolean
  initialJson?: string
}

export interface JsonEditorHandle {
  submit: () => void
  reset: () => void
}

const textareaClass = 'w-full min-h-[34rem] px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none'

const JsonEditor = forwardRef<JsonEditorHandle, Props>(function JsonEditor(
  { onSubmit, loading, initialJson },
  ref,
) {
  const defaultJson = JSON.stringify(buildRequest(defaultFormState), null, 2)
  const startJson = initialJson ?? defaultJson
  const [json, setJson] = useState(startJson)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(() => {
    try {
      JSON.parse(json)
      setError(null)
      onSubmit(json)
    } catch {
      setError('Invalid JSON - please check syntax before sending.')
    }
  }, [json, onSubmit])

  const format = useCallback(() => {
    try {
      const parsed = JSON.parse(json)
      setJson(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch {
      setError('Cannot format - JSON is invalid.')
    }
  }, [json])

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(json)
      setJson(JSON.stringify(parsed))
      setError(null)
    } catch {
      setError('Cannot minify - JSON is invalid.')
    }
  }, [json])

  const reset = useCallback(() => {
    setJson(startJson)
    setError(null)
  }, [startJson])

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset,
  }), [handleSubmit, reset])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">JSON Editor</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
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
        className={`${textareaClass} pro-scrollbar-thin`}
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
})

export default JsonEditor
