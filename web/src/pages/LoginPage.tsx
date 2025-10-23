import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DarkModeToggle } from '../components/DarkModeToggle';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleCognitoLogin = () => {
    console.log('[LOGIN DEBUG] Initiating Cognito OAuth login');
    console.log('[LOGIN DEBUG] Environment:', {
      LOCAL_DEV: import.meta.env.VITE_LOCAL_DEV,
      USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
      COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN,
      COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID,
    });
    
    try {
      login();
    } catch (err) {
      console.error('[LOGIN DEBUG] Redirect error:', err);
      setError('Failed to initiate login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Dark mode toggle in top right corner */}
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to CourierCue
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Delivery management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleCognitoLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in with Cognito
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            You will be redirected to AWS Cognito for secure authentication
          </div>
        </div>
      </div>
    </div>
  );
}
