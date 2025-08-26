class CognitoService {
  private userPoolDomain: string
  private clientId: string
  private redirectUri: string

  constructor() {
    this.userPoolDomain = import.meta.env.VITE_USER_POOL_DOMAIN
    this.clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID
    this.redirectUri = `${window.location.origin}/courier-cue/callback`
  }

  signIn() {
    if (!this.userPoolDomain || !this.clientId) {
      console.error('Cognito configuration missing')
      alert('Authentication not configured. This is expected in the foundation deployment.')
      return
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'email openid profile'
    })

    const authUrl = `${this.userPoolDomain}/login?${params.toString()}`
    window.location.href = authUrl
  }

  signOut() {
    if (!this.userPoolDomain || !this.clientId) {
      return
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      logout_uri: `${window.location.origin}/courier-cue/`
    })

    const logoutUrl = `${this.userPoolDomain}/logout?${params.toString()}`
    window.location.href = logoutUrl
  }
}

export const cognitoService = new CognitoService()
