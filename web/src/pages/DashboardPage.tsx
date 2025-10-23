import { useUser } from '../hooks/useUser';
import { Navigation } from '../components/Navigation';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadsApi } from '../lib/api';

export default function DashboardPage() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        let loadsResponse;
        
        if (currentUser.role === 'driver') {
          // Get driver's specific loads
          loadsResponse = await loadsApi.myLoads();
        } else {
          // Get all organization loads
          loadsResponse = await loadsApi.list();
        }
        
        const loads = loadsResponse.loads || [];
        const newStats = {
          total: loads.length,
          pending: loads.filter((load: any) => ['PENDING', 'ASSIGNED', 'EN_ROUTE'].includes(load.status)).length,
          completed: loads.filter((load: any) => ['DELIVERED', 'COMPLETED'].includes(load.status)).length
        };
        
        setStats(newStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [currentUser]);

  if (!currentUser) return null;

  const loadBaseUrl = currentUser.role === 'driver' ? '/driver/loads' : '/loads';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              onClick={() => navigate(loadBaseUrl)}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {currentUser.role === 'driver' ? 'My Loads' : 'Total Loads'}
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : stats.total}
              </p>
            </div>
            <div
              onClick={() => navigate(`${loadBaseUrl}?status=pending`)}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : stats.pending}
              </p>
            </div>
            <div
              onClick={() => navigate(`${loadBaseUrl}?status=completed`)}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : stats.completed}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
