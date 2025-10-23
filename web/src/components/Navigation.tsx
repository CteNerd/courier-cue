import { useUser } from '../hooks/useUser';
import { DarkModeToggle } from './DarkModeToggle';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false;

export function Navigation() {
  const { currentUser, logout } = useUser();

  if (!currentUser) return null;

  const navItems = currentUser.role === 'driver' 
    ? [
        { name: 'My Loads', href: '/driver/loads' },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Loads', href: '/loads' },
        ...(currentUser.role === 'admin' || currentUser.role === 'coadmin' ? [{ name: 'Users', href: '/users' }] : []),
        { name: 'Settings', href: '/settings' },
      ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">CourierCue</h1>
            <div className="flex space-x-4">
              {navItems.map(item => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">{currentUser.displayName}</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              {currentUser.role}
            </span>
            {/* API Status Indicator */}
            <span className={`text-xs px-2 py-1 rounded-full ${
              USE_MOCK_API 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            }`}>
              {USE_MOCK_API ? '🔧 Mock API' : '🚀 Real API'}
            </span>
            <DarkModeToggle />
            <button
              onClick={logout}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}