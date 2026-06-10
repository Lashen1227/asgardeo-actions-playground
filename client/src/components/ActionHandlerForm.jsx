import { useState } from 'react'
import './ActionHandlerForm.css'

const ActionHandlerForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    actionType: 'PRE_ISSUE_ACCESS_TOKEN',
    clientId: 'test-client',
    grantType: 'authorization_code',
    scopes: 'openid profile',
    userId: 'test-user-id',
    orgId: 'test-org-id',
    orgName: 'Test Organization',
    orgHandle: 'test-org',
    tenantId: 'test-tenant',
    tenantName: 'test-tenant',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const requestData = {
      actionType: formData.actionType,
      event: {
        request: {
          clientId: formData.clientId,
          grantType: formData.grantType,
          scopes: formData.scopes.split(',').map(s => s.trim()).filter(s => s)
        },
        tenant: {
          id: formData.tenantId,
          name: formData.tenantName
        },
        user: {
          id: formData.userId,
          organization: {
            id: formData.orgId,
            name: formData.orgName,
            orgHandle: formData.orgHandle
          }
        },
        accessToken: {
          tokenType: 'JWT',
          claims: [
            {
              name: 'sub',
              value: formData.userId
            }
          ],
          scopes: formData.scopes.split(',').map(s => s.trim()).filter(s => s)
        }
      },
      requestId: `req-${Date.now()}`
    }

    onSubmit(requestData)
  }

  return (
    <div className="form-container">
      <h2>Action Handler Request</h2>
      <form onSubmit={handleSubmit} className="action-form">
        <div className="form-group">
          <label htmlFor="actionType">Action Type</label>
          <select
            id="actionType"
            name="actionType"
            value={formData.actionType}
            onChange={handleChange}
            required
          >
            <option value="PRE_ISSUE_ACCESS_TOKEN">PRE_ISSUE_ACCESS_TOKEN</option>
          </select>
        </div>

        <div className="form-section">
          <h3>Request Details</h3>
          <div className="form-group">
            <label htmlFor="clientId">Client ID</label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="grantType">Grant Type</label>
            <input
              type="text"
              id="grantType"
              name="grantType"
              value={formData.grantType}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="scopes">Scopes (comma-separated)</label>
            <input
              type="text"
              id="scopes"
              name="scopes"
              value={formData.scopes}
              onChange={handleChange}
              placeholder="openid, profile, email"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>User Information</h3>
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="orgId">Organization ID</label>
            <input
              type="text"
              id="orgId"
              name="orgId"
              value={formData.orgId}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="orgName">Organization Name</label>
            <input
              type="text"
              id="orgName"
              name="orgName"
              value={formData.orgName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="orgHandle">Organization Handle</label>
            <input
              type="text"
              id="orgHandle"
              name="orgHandle"
              value={formData.orgHandle}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Tenant Information</h3>
          <div className="form-group">
            <label htmlFor="tenantId">Tenant ID</label>
            <input
              type="text"
              id="tenantId"
              name="tenantId"
              value={formData.tenantId}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tenantName">Tenant Name</label>
            <input
              type="text"
              id="tenantName"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
    </div>
  )
}

export default ActionHandlerForm
