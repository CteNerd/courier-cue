import { useUser } from '../hooks/useUser';
import { DarkModeToggle } from './DarkModeToggle';

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
        ...(currentUser.role === 'admin' || currentUser.role === 'co-admin' ? [{ name: 'Users', href: '/users' }] : []),
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