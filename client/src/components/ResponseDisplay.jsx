import { useState } from 'react'
import './ResponseDisplay.css'

const ResponseDisplay = ({ response }) => {
  const [expanded, setExpanded] = useState(true)

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="response-container">
      <div className="response-header">
        <h2>Server Response</h2>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="toggle-button"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {expanded && (
        <div className="response-content">
          <pre className="json-display">{formatJson(response)}</pre>
          
          {response.event?.accessToken && (
            <div className="token-info">
              <h3>Access Token Information</h3>
              <div className="info-grid">
                <div>
                  <strong>Token Type:</strong> {response.event.accessToken.tokenType || 'N/A'}
                </div>
                {response.event.accessToken.scopes && (
                  <div>
                    <strong>Scopes:</strong> {response.event.accessToken.scopes.join(', ')}
                  </div>
                )}
                {response.event.accessToken.claims && (
                  <div className="claims-section">
                    <strong>Claims:</strong>
                    <ul>
                      {response.event.accessToken.claims.map((claim, index) => (
                        <li key={index}>
                          <strong>{claim.name}:</strong>{' '}
                          {Array.isArray(claim.value) 
                            ? claim.value.join(', ') 
                            : claim.value.toString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResponseDisplay
