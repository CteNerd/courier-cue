import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code)
        .then(() => {
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('Callback failed:', error);
          navigate('/login');
        });
    } else {
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
