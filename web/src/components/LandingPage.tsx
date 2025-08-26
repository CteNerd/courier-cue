import { useState, useEffect } from 'react'
import { cognitoService } from '../services/cognito.ts'

const LandingPage = () => {
  const [buildInfo] = useState({
    version: import.meta.env.VITE_VERSION,
    buildTime: import.meta.env.VITE_BUILD_TIME,
    apiUrl: import.meta.env.VITE_API_URL
  })

  const [healthStatus, setHealthStatus] = useState<'loading' | 'healthy' | 'error'>('loading')

  useEffect(() => {
    // Check API health on load
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then(response => response.json())
      .then(() => setHealthStatus('healthy'))
      .catch(() => setHealthStatus('error'))
  }, [])

  const handleSignIn = () => {
    cognitoService.signIn()
  }

  return (
    <div className="card">
      <h1>Courier Cue</h1>
      <p>Delivery Management System</p>
      
      <div className="build-info">
        <p><strong>Version:</strong> {buildInfo.version}</p>
        <p><strong>Built:</strong> {new Date(buildInfo.buildTime).toLocaleString()}</p>
        <p><strong>API Status:</strong> 
          <span style={{ 
            color: healthStatus === 'healthy' ? '#4ade80' : 
                   healthStatus === 'error' ? '#f87171' : '#fbbf24' 
          }}>
            {healthStatus === 'loading' ? ' Checking...' : 
             healthStatus === 'healthy' ? ' Connected' : ' Disconnected'}
          </span>
        </p>
      </div>

      <button className="sign-in-button" onClick={handleSignIn}>
        Sign In
      </button>

      <div className="build-info">
        <p><strong>Demo Users:</strong></p>
        <ul style={{ textAlign: 'left', fontSize: '14px' }}>
          <li><strong>Dispatcher:</strong> Create and assign orders, monitor deliveries</li>
          <li><strong>Driver:</strong> Receive assignments, complete deliveries with digital signatures</li>
          <li><strong>Admin:</strong> Full system access and user management</li>
        </ul>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '16px' }}>
          Contact your system administrator to get added to the appropriate Cognito user group.
        </p>
      </div>
    </div>
  )
}

export default LandingPage
