import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CallbackPage = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(`Authentication failed: ${error}`)
      setTimeout(() => navigate('/'), 3000)
    } else if (code) {
      // In a real app, you'd exchange the code for tokens here
      setStatus('success')
      setMessage('Authentication successful! Redirecting...')
      setTimeout(() => navigate('/'), 2000)
    } else {
      setStatus('error')
      setMessage('No authentication code received')
      setTimeout(() => navigate('/'), 3000)
    }
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
