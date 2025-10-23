import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { DEMO_API_USERS } from '../lib/demoAuth';
import { DarkModeToggle } from '../components/DarkModeToggle';

export default function LoginPage() {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('[LOGIN DEBUG] Form submitted:', {
      email,
      hasPassword: !!password,
      LOCAL_DEV: import.meta.env.VITE_LOCAL_DEV,
      USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
    });

    try {
      const success = await login(email, password);
      console.log('[LOGIN DEBUG] Login result:', { success });
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('[LOGIN DEBUG] Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoUser = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
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
          Demo delivery management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
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
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Users</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {DEMO_API_USERS.map((user) => (
                <button
                  key={user.userId}
                  type="button"
                  onClick={() => handleDemoUser(user.email, user.password)}
                  className="w-full inline-flex justify-between items-center px-4 py-2 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span>{user.displayName}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Click a demo user to auto-fill credentials, then sign in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
