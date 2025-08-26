import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cognitoService } from '../services/cognito'
import { apiService } from '../services/api'

const CallbackPage = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`Authentication failed: ${error}`)
        setTimeout(() => navigate('/'), 3000)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authentication code received')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      try {
        // Exchange code for tokens
        const tokens = await cognitoService.exchangeCodeForTokens(code)
        if (!tokens) {
          throw new Error('Failed to exchange code for tokens')
        }

        // Set up API service with access token
        apiService.setAccessToken(tokens.access_token)

        setStatus('success')
        setMessage('Authentication successful! Redirecting...')
        setTimeout(() => navigate('/'), 1000)
      } catch (err) {
        console.error('Authentication error:', err)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => navigate('/'), 3000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="card">
      <h2>Authentication</h2>
      <p className={status === 'error' ? 'error' : ''}>{message}</p>
      {status === 'processing' && <div>⏳</div>}
      {status === 'success' && <div>✅</div>}
      {status === 'error' && <div>❌</div>}
    </div>
  )
}

export default CallbackPage
