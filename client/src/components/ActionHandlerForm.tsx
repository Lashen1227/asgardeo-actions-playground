import { useState } from 'react'
import { FormState, Claim, defaultFormState, buildRequest, ActionHandlerRequest } from '../types'

interface Props {
  onSubmit: (data: ActionHandlerRequest) => void
  loading: boolean
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm'
const labelClass = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider'
const sectionClass = 'p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'

export default function ActionHandlerForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormState>(defaultFormState)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    set(e.target.name as keyof FormState, e.target.value)
  }

  const addClaim = () => {
    setForm(prev => ({
      ...prev,
      claims: [...prev.claims, { name: '', value: '' }],
    }))
  }

  const removeClaim = (i: number) => {
    setForm(prev => ({
      ...prev,
      claims: prev.claims.filter((_, idx) => idx !== i),
    }))
  }

  const updateClaim = (i: number, field: keyof Claim, val: string) => {
    setForm(prev => {
      const claims = [...prev.claims]
      if (field === 'value') {
        const parsed: string | number = val === '' ? '' : isNaN(Number(val)) ? val : Number(val)
        claims[i] = { ...claims[i], value: parsed }
      } else {
        claims[i] = { ...claims[i], name: val }
      }
      return { ...prev, claims }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(buildRequest(form))
  }

  const loadSample = async () => {
    try {
      const res = await fetch('/new.json')
      const data = await res.json()
      setForm(prev => ({ ...prev, rawJson: JSON.stringify(data, null, 2) }))
    } catch {
      const resp = await fetch('http://localhost:9090/action-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequest(form)),
      })
      const data = await resp.json()
      setForm(prev => ({ ...prev, rawJson: JSON.stringify(data, null, 2) }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Action Type */}
      <div className={sectionClass}>
        <label className={labelClass}>Action Type</label>
        <select
          name="actionType"
          value={form.actionType}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="PRE_ISSUE_ACCESS_TOKEN">PRE_ISSUE_ACCESS_TOKEN</option>
        </select>
      </div>

      {/* Request Details */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Request Details</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Client ID</label>
            <input name="clientId" value={form.clientId} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Grant Type</label>
            <input name="grantType" value={form.grantType} onChange={handleChange} className={inputClass} placeholder="authorization_code" />
          </div>
          <div>
            <label className={labelClass}>Scopes (comma separated)</label>
            <input name="scopes" value={form.scopes} onChange={handleChange} className={inputClass} placeholder="openid, profile, email" />
          </div>
        </div>
      </div>

      {/* User */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">User Information</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>User ID</label>
            <input name="userId" value={form.userId} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Organization ID</label>
            <input name="orgId" value={form.orgId} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Organization Name</label>
            <input name="orgName" value={form.orgName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Organization Handle</label>
            <input name="orgHandle" value={form.orgHandle} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Tenant */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Tenant Information</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Tenant ID</label>
            <input name="tenantId" value={form.tenantId} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tenant Name</label>
            <input name="tenantName" value={form.tenantName} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Access Token */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Access Token</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Token Type</label>
            <input name="tokenType" value={form.tokenType} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Token Scopes (comma separated, overrides request scopes)</label>
            <input name="accessTokenScopes" value={form.accessTokenScopes} onChange={handleChange} className={inputClass} placeholder="Leave empty to use request scopes" />
          </div>

          {/* Claims */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>Claims</label>
              <button type="button" onClick={addClaim} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                + Add Claim
              </button>
            </div>
            {form.claims.length === 0 && (
              <p className="text-xs text-gray-400 italic">No claims defined</p>
            )}
            <div className="space-y-2">
              {form.claims.map((claim, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    value={claim.name}
                    onChange={e => updateClaim(i, 'name', e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="Claim name"
                  />
                  <input
                    value={String(claim.value)}
                    onChange={e => updateClaim(i, 'value', e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    onClick={() => removeClaim(i)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Remove claim"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Sending...
            </span>
          ) : 'Send Request'}
        </button>
        <button
          type="button"
          onClick={() => setForm(defaultFormState)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition text-sm"
        >
          Reset
        </button>
      </div>

      {/* Request Preview */}
      <details className="group">
        <summary className="cursor-pointer text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 select-none">
          <span className="group-open:hidden">▶</span>
          <span className="hidden group-open:inline">▼</span>
          {' '}Request Preview
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-gray-900 text-gray-100 text-xs overflow-auto max-h-80 border border-gray-700">
          {JSON.stringify(buildRequest(form), null, 2)}
        </pre>
      </details>
    </form>
  )
}
