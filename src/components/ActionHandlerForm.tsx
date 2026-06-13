import { useState } from 'react'
import { FormState, Claim, ProfileClaim, defaultFormState, buildRequest, ActionHandlerRequest } from '../types'

interface Props {
  onSubmit: (data: ActionHandlerRequest) => void
  loading: boolean
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm'
const selectClass = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm'
const labelClass = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider'
const sectionClass = 'p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'

function isTokenAction(type: string) {
  return type === 'PRE_ISSUE_ACCESS_TOKEN' || type === 'PRE_ISSUE_ID_TOKEN'
}

function isPasswordAction(type: string) {
  return type === 'PRE_UPDATE_PASSWORD'
}

function isProfileAction(type: string) {
  return type === 'PRE_UPDATE_PROFILE'
}

export default function ActionHandlerForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormState>(defaultFormState)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    set(e.target.name as keyof FormState, e.target.value)
  }

  const addClaim = (field: 'claims' | 'idTokenClaims') => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], { name: '', value: '' }],
    }))
  }

  const removeClaim = (field: 'claims' | 'idTokenClaims', i: number) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== i),
    }))
  }

  const updateClaim = (field: 'claims' | 'idTokenClaims', i: number, key: keyof Claim, val: string) => {
    setForm(prev => {
      const list = [...prev[field]]
      if (key === 'value') {
        const parsed: string | number = val === '' ? '' : isNaN(Number(val)) ? val : Number(val)
        list[i] = { ...list[i], value: parsed }
      } else {
        list[i] = { ...list[i], name: val }
      }
      return { ...prev, [field]: list }
    })
  }

  const addProfileClaim = () => {
    setForm(prev => ({
      ...prev,
      profileClaims: [...prev.profileClaims, { uri: '', value: '', updatingValue: '' }],
    }))
  }

  const removeProfileClaim = (i: number) => {
    setForm(prev => ({
      ...prev,
      profileClaims: prev.profileClaims.filter((_, idx) => idx !== i),
    }))
  }

  const updateProfileClaim = (i: number, key: keyof ProfileClaim, val: string) => {
    setForm(prev => {
      const list = [...prev.profileClaims]
      if (key === 'value' || key === 'updatingValue') {
        list[i] = { ...list[i], [key]: val.includes(',') ? val.split(',').map(s => s.trim()).filter(Boolean) : val }
      } else {
        list[i] = { ...list[i], [key]: val }
      }
      return { ...prev, profileClaims: list }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(buildRequest(form))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className={sectionClass}>
        <label className={labelClass}>Action Type</label>
        <select
          name="actionType"
          value={form.actionType}
          onChange={e => {
            setForm(prev => ({ ...prev, actionType: e.target.value }))
          }}
          className={selectClass}
        >
          <option value="PRE_ISSUE_ACCESS_TOKEN">PRE_ISSUE_ACCESS_TOKEN</option>
          <option value="PRE_ISSUE_ID_TOKEN">PRE_ISSUE_ID_TOKEN</option>
          <option value="PRE_UPDATE_PASSWORD">PRE_UPDATE_PASSWORD</option>
          <option value="PRE_UPDATE_PROFILE">PRE_UPDATE_PROFILE</option>
        </select>
      </div>

      {(isTokenAction(form.actionType)) && (
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
            {form.actionType === 'PRE_ISSUE_ID_TOKEN' && (
              <div>
                <label className={labelClass}>Response Type (hybrid flow)</label>
                <input name="responseType" value={form.responseType} onChange={handleChange} className={inputClass} placeholder="code id_token token" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className={sectionClass}>
        <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">User Information</h3>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>User ID</label>
            <input name="userId" value={form.userId} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>User Type</label>
            <select name="userType" value={form.userType} onChange={handleChange} className={selectClass}>
              <option value="LOCAL">LOCAL</option>
              <option value="FEDERATED">FEDERATED</option>
            </select>
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

      {form.actionType === 'PRE_ISSUE_ACCESS_TOKEN' && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Access Token</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Token Type</label>
              <input name="tokenType" value={form.tokenType} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Token Scopes (comma separated)</label>
              <input name="accessTokenScopes" value={form.accessTokenScopes} onChange={handleChange} className={inputClass} placeholder="Leave empty to use request scopes" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Claims</label>
                <button type="button" onClick={() => addClaim('claims')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  + Add Claim
                </button>
              </div>
              {form.claims.length === 0 && (
                <p className="text-xs text-gray-400 italic">No claims defined</p>
              )}
              <div className="space-y-2">
                {form.claims.map((claim, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input value={claim.name} onChange={e => updateClaim('claims', i, 'name', e.target.value)} className={`${inputClass} flex-1`} placeholder="Claim name" />
                    <input value={String(claim.value)} onChange={e => updateClaim('claims', i, 'value', e.target.value)} className={`${inputClass} flex-1`} placeholder="Value" />
                    <button type="button" onClick={() => removeClaim('claims', i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Remove claim">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {form.actionType === 'PRE_ISSUE_ID_TOKEN' && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">ID Token</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Claims</label>
                <button type="button" onClick={() => addClaim('idTokenClaims')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  + Add Claim
                </button>
              </div>
              {form.idTokenClaims.length === 0 && (
                <p className="text-xs text-gray-400 italic">No claims defined</p>
              )}
              <div className="space-y-2">
                {form.idTokenClaims.map((claim, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input value={claim.name} onChange={e => updateClaim('idTokenClaims', i, 'name', e.target.value)} className={`${inputClass} flex-1`} placeholder="Claim name" />
                    <input value={String(claim.value)} onChange={e => updateClaim('idTokenClaims', i, 'value', e.target.value)} className={`${inputClass} flex-1`} placeholder="Value" />
                    <button type="button" onClick={() => removeClaim('idTokenClaims', i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Remove claim">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isPasswordAction(form.actionType) && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Password Update</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Initiator Type</label>
              <select name="initiatorType" value={form.initiatorType} onChange={handleChange} className={selectClass}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="APPLICATION">APPLICATION</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Action</label>
              <select name="action" value={form.action} onChange={handleChange} className={selectClass}>
                <option value="UPDATE">UPDATE</option>
                <option value="RESET">RESET</option>
                <option value="INVITE">INVITE</option>
                <option value="REGISTER">REGISTER</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Credential Format</label>
              <select name="credentialFormat" value={form.credentialFormat} onChange={handleChange} className={selectClass}>
                <option value="PLAIN_TEXT">PLAIN_TEXT</option>
                <option value="HASH">HASH</option>
              </select>
            </div>
            {form.credentialFormat === 'HASH' && (
              <div>
                <label className={labelClass}>Hash Algorithm</label>
                <input name="credentialAlgorithm" value={form.credentialAlgorithm} onChange={handleChange} className={inputClass} placeholder="SHA256" />
              </div>
            )}
            <div>
              <label className={labelClass}>Password Value</label>
              <input name="credentialValue" value={form.credentialValue} onChange={handleChange} className={inputClass} type="password" />
            </div>
          </div>
        </div>
      )}

      {isProfileAction(form.actionType) && (
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Profile Update</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Initiator Type</label>
              <select name="initiatorType" value={form.initiatorType} onChange={handleChange} className={selectClass}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="APPLICATION">APPLICATION</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass}>Profile Claims</label>
                <button type="button" onClick={addProfileClaim} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  + Add Profile Claim
                </button>
              </div>
              {form.profileClaims.length === 0 && (
                <p className="text-xs text-gray-400 italic">No profile claims defined</p>
              )}
              <div className="space-y-3">
                {form.profileClaims.map((pc, i) => (
                  <div key={i} className="p-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                    <input value={pc.uri} onChange={e => updateProfileClaim(i, 'uri', e.target.value)} className={`${inputClass} text-xs`} placeholder="http://wso2.org/claims/emailAddresses" />
                    <div className="flex gap-2">
                      <input value={Array.isArray(pc.value) ? pc.value.join(', ') : String(pc.value)} onChange={e => updateProfileClaim(i, 'value', e.target.value)} className={`${inputClass} flex-1 text-xs`} placeholder="Current value(s)" />
                      <input value={Array.isArray(pc.updatingValue) ? pc.updatingValue.join(', ') : String(pc.updatingValue || '')} onChange={e => updateProfileClaim(i, 'updatingValue', e.target.value)} className={`${inputClass} flex-1 text-xs`} placeholder="New value(s)" />
                      <button type="button" onClick={() => removeProfileClaim(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition shrink-0" title="Remove">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Processing...
            </span>
          ) : 'Process'}
        </button>
        <button
          type="button"
          onClick={() => setForm(defaultFormState)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition text-sm"
        >
          Reset
        </button>
      </div>

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
