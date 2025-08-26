interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserInfo {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  'cognito:groups'?: string[];
}

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

  async exchangeCodeForTokens(code: string): Promise<TokenResponse | null> {
    if (!this.userPoolDomain || !this.clientId) {
      return null
    }

    try {
      const response = await fetch(`${this.userPoolDomain}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          code: code,
          redirect_uri: this.redirectUri,
        }),
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`)
      }

      const tokens = await response.json()
      this.storeTokens(tokens)
      return tokens
    } catch (error) {
      console.error('Token exchange failed:', error)
      return null
    }
  }

  private storeTokens(tokens: TokenResponse) {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('id_token', tokens.id_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    localStorage.setItem('token_expires_at', 
      (Date.now() + tokens.expires_in * 1000).toString()
    )
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem('access_token')
    const expiresAt = localStorage.getItem('token_expires_at')
    
    if (!token || !expiresAt) {
      return null
    }

    if (Date.now() > parseInt(expiresAt)) {
      this.clearTokens()
      return null
    }

    return token
  }

  getIdToken(): string | null {
    return localStorage.getItem('id_token')
  }

  async getUserInfo(): Promise<UserInfo | null> {
    const accessToken = this.getAccessToken()
    if (!accessToken) {
      return null
    }

    try {
      const response = await fetch(`${this.userPoolDomain}/oauth2/userInfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`UserInfo request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get user info:', error)
      return null
    }
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }

  hasRole(role: string): boolean {
    const idToken = this.getIdToken()
    if (!idToken) {
      return false
    }

    try {
      // Parse JWT payload (simple base64 decode)
      const payload = JSON.parse(atob(idToken.split('.')[1]))
      const groups = payload['cognito:groups'] || []
      return groups.includes(role)
    } catch (error) {
      console.error('Failed to parse ID token:', error)
      return false
    }
  }

  getUserRoles(): string[] {
    const idToken = this.getIdToken()
    if (!idToken) {
      return []
    }

    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]))
      return payload['cognito:groups'] || []
    } catch (error) {
      console.error('Failed to parse ID token:', error)
      return []
    }
  }

  private clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
  }

  signOut() {
    this.clearTokens()
    
    if (!this.userPoolDomain || !this.clientId) {
      window.location.href = '/'
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
export type { UserInfo }
