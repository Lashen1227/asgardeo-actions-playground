import { useState } from 'react'
import './App.css'
import ActionHandlerForm from './components/ActionHandlerForm'
import ResponseDisplay from './components/ResponseDisplay'

function App() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (requestData) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const response = await fetch('http://localhost:9090/action-handler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>WSO2 Asgardeo Action Handler Client</h1>
        <p>Test and interact with the Asgardeo Action Handler service</p>
      </header>

      <main className="app-main">
        <div className="container">
          <ActionHandlerForm onSubmit={handleSubmit} loading={loading} />
          
          {error && (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {response && <ResponseDisplay response={response} />}
        </div>
      </main>
    </div>
  )
}

export default App
