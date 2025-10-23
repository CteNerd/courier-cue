import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log('[CALLBACK DEBUG] CallbackPage mounted:', {
      hasCode: !!code,
      code: code?.substring(0, 20) + '...',
      error,
      errorDescription,
      fullUrl: window.location.href,
      searchParams: Object.fromEntries(searchParams),
    });
    
    if (error) {
      console.error('[CALLBACK DEBUG] OAuth error received:', { error, errorDescription });
      navigate('/login');
      return;
    }
    
    if (code) {
      console.log('[CALLBACK DEBUG] Processing authorization code...');
      handleCallback(code)
        .then(() => {
          console.log('[CALLBACK DEBUG] Callback successful, navigating to dashboard');
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('[CALLBACK DEBUG] Callback failed:', error);
          navigate('/login');
        });
    } else {
      console.warn('[CALLBACK DEBUG] No code or error found, redirecting to login');
      navigate('/login');
    }
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
