import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage.tsx'
import CallbackPage from './components/CallbackPage.tsx'
import DispatcherDashboard from './components/DispatcherDashboard.tsx'
import DriverDashboard from './components/DriverDashboard.tsx'
import { cognitoService } from './services/cognito.ts'
import { apiService } from './services/api.ts'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setLoading(true)
    try {
      const authenticated = cognitoService.isAuthenticated()
      setIsAuthenticated(authenticated)

      if (authenticated) {
        // Set up API service with access token
        const accessToken = cognitoService.getAccessToken()
        if (accessToken) {
          apiService.setAccessToken(accessToken)
        }

        // Get user roles
        const roles = cognitoService.getUserRoles()
        setUserRoles(roles)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUserRoles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    cognitoService.signOut()
    setIsAuthenticated(false)
    setUserRoles([])
  }

  const getDashboardComponent = () => {
    if (userRoles.includes('dispatcher') || userRoles.includes('admin')) {
      return <DispatcherDashboard onSignOut={handleSignOut} />
    } else if (userRoles.includes('driver')) {
      return <DriverDashboard onSignOut={handleSignOut} />
    } else {
      return (
        <div className="card">
          <h2>Access Denied</h2>
          <p>You don't have the required permissions to access this application.</p>
          <p>Your roles: {userRoles.length > 0 ? userRoles.join(', ') : 'None'}</p>
          <button onClick={handleSignOut} style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Sign Out
          </button>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="App">
        <div className="card">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? getDashboardComponent() : <LandingPage />
          } 
        />
        <Route path="/callback" element={<CallbackPage />} />
      </Routes>
    </div>
  )
}

export default App
