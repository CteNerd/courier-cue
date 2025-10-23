import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DarkModeToggle } from '../components/DarkModeToggle';

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@couriertest.com', password: 'Admin123!' },
  { role: 'Co-Admin', email: 'coadmin@couriertest.com', password: 'Coadmin123!' },
  { role: 'Driver', email: 'driver@couriertest.com', password: 'Driver123!' },
];

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

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            You will be redirected to AWS Cognito for secure authentication
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4 text-center">
              Demo Credentials
            </h3>
            <div className="space-y-3">
              {DEMO_CREDENTIALS.map((cred, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {cred.role}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Email:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cred.email);
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-mono"
                      >
                        {cred.email} 📋
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Password:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cred.password);
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-mono"
                      >
                        {cred.password} 📋
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Click on credentials to copy them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
