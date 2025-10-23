import { useUser } from '../hooks/useUser';
import { loadsApi } from '../lib/api';
import { Navigation } from '../components/Navigation';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Load } from '../data/mockData';

export default function DriverLoadsPage() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [myLoads, setMyLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  // Redirect non-drivers
  // Load driver's loads on mount
  const loadMyLoads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters: Record<string, string> = {};
      if (filters.dateFrom) apiFilters.from = filters.dateFrom;
      if (filters.dateTo) apiFilters.to = filters.dateTo;
      
      const response = await loadsApi.myLoads(apiFilters);
      let loads = response.loads || [];
      
      // Apply status filter client-side
      if (filters.status) {
        loads = loads.filter(load => load.status === filters.status);
      }
      
      setMyLoads(loads);
    } catch (err) {
      console.error('Failed to load my loads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load loads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'driver') {
      loadMyLoads();
    }
  }, [filters, currentUser, loadMyLoads]);

  if (!currentUser || currentUser.role !== 'driver') {
    return <Navigate to="/login" replace />;
  }

  const getStatusColor = (status: Load['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'EN_ROUTE': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (load: Load) => {
    switch (load.status) {
      case 'ASSIGNED':
        return (
          <button 
            onClick={() => navigate(`/loads/${load.id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Start Route
          </button>
        );
      
      case 'EN_ROUTE':
        return (
          <button 
            onClick={() => navigate(`/loads/${load.id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Mark Delivered
          </button>
        );
      
      case 'DELIVERED':
        return (
          <button 
            onClick={() => navigate(`/loads/${load.id}`)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
          >
            Get Signature
          </button>
        );
      
      default:
        return (
          <button 
            onClick={() => navigate(`/loads/${load.id}`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
          >
            View Details
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Loads ({myLoads.length})
            </h2>
            <button
              onClick={loadMyLoads}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Refresh
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                  <div className="mt-4">
                    <button
                      onClick={() => setError(null)}
                      className="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="EN_ROUTE">En Route</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <button
                onClick={() => setFilters({ dateFrom: '', dateTo: '', status: '' })}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Workflow Help */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Load Workflow</h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>ASSIGNED:</strong> Load assigned to you - click to start route</p>
              <p><strong>EN ROUTE:</strong> You're traveling to pickup/delivery - click to mark delivered</p>
              <p><strong>DELIVERED:</strong> Load delivered - click to capture signature</p>
              <p><strong>COMPLETED:</strong> Load fully completed with signature</p>
            </div>
          </div>

          {/* Loads List */}
          {myLoads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚛</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No loads found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {Object.values(filters).some(v => v) 
                  ? 'Try adjusting your filters.' 
                  : 'You have no loads assigned yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myLoads.map((load) => (
                <div 
                  key={load.id} 
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/loads/${load.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{load.id}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{load.serviceAddress.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(load.status)}`}>
                      {load.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-sm dark:text-gray-300">
                        {load.serviceAddress.street}<br />
                        {load.serviceAddress.city}, {load.serviceAddress.state} {load.serviceAddress.zip}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                      <p className="text-sm dark:text-gray-300">
                        {load.serviceAddress.contact}<br />
                        <a 
                          href={`tel:${load.serviceAddress.phone}`} 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {load.serviceAddress.phone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      📦 {load.items.reduce((sum, item) => sum + item.qty, 0)} items
                      {load.shipVia && ` • 🚚 ${load.shipVia}`}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {getActionButton(load)}
                    </div>
                  </div>

                  {load.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Notes:</strong> {load.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
