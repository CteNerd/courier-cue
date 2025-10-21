import { useUser } from '../hooks/useUser';
import { getLoadStats, getLoadsByDriver } from '../data/mockData';
import { Navigation } from '../components/Navigation';

export default function DashboardPage() {
  const { currentUser } = useUser();
  const stats = getLoadStats();

  if (!currentUser) return null;

  // For drivers, we need to get their specific stats
  const getDriverStats = () => {
    if (currentUser.role === 'driver') {
      const driverLoads = getLoadsByDriver(currentUser.userId);
      return {
        total: driverLoads.length,
        pending: driverLoads.filter(load => ['PENDING', 'ASSIGNED', 'EN_ROUTE'].includes(load.status)).length,
        completed: driverLoads.filter(load => ['DELIVERED', 'COMPLETED'].includes(load.status)).length
      };
    }
    return stats;
  };

  const displayStats = getDriverStats();
  const loadBaseUrl = currentUser.role === 'driver' ? '/driver/loads' : '/loads';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a
              href={loadBaseUrl}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {currentUser.role === 'driver' ? 'My Loads' : 'Total Loads'}
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{displayStats.total}</p>
            </a>
            <a
              href={`${loadBaseUrl}?status=pending`}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{displayStats.pending}</p>
            </a>
            <a
              href={`${loadBaseUrl}?status=completed`}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{displayStats.completed}</p>
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <p className="text-gray-600 dark:text-gray-300">Load management system is ready for development!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              API Server: <span className="text-green-600 dark:text-green-400">Running on localhost:3001</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Database: <span className="text-green-600 dark:text-green-400">Connected to local DynamoDB</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
