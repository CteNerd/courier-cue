import { useUser } from '../hooks/useUser';
import { loadsApi, orgApi } from '../lib/api';
import CreateLoadForm from '../components/CreateLoadForm';
import { Navigation } from '../components/Navigation';
import { useState, useEffect } from 'react';

interface Load {
  loadId: string;
  status: 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  serviceAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    contact: string;
    phone: string;
    email?: string;
  };
  items: Array<{
    type: string;
    qty: number;
  }>;
  notes?: string;
  unloadLocation?: string;
  shipVia?: string;
}

interface User {
  userId: string;
  email: string;
  displayName: string;
  role: string;
}

export default function LoadsPage() {
  const { currentUser } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLoadForAssignment, setSelectedLoadForAssignment] = useState<Load | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    driverId: '',
    searchQuery: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Redirect drivers to their specific loads page
  if (!currentUser) return null;
  
  if (currentUser.role === 'driver') {
    window.location.href = '/driver/loads';
    return null;
  }

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load loads and users in parallel
      const [loadsResponse, usersResponse] = await Promise.all([
        loadsApi.list(buildApiFilters()),
        orgApi.listUsers()
      ]);
      
      setLoads(loadsResponse.loads || []);
      setUsers(usersResponse.users || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const buildApiFilters = () => {
    const apiFilters: any = {};
    if (filters.status) apiFilters.status = filters.status;
    if (filters.driverId) apiFilters.driverId = filters.driverId;
    if (filters.searchQuery) apiFilters.q = filters.searchQuery;
    if (filters.dateFrom) apiFilters.from = filters.dateFrom;
    if (filters.dateTo) apiFilters.to = filters.dateTo;
    return apiFilters;
  };

  // Apply filters
  useEffect(() => {
    loadData();
  }, [filters]);

  const availableDrivers = users.filter(user => user.role === 'driver');

  const handleAssignLoad = async (loadId: string, driverId: string) => {
    try {
      await loadsApi.update(loadId, { 
        assignedDriverId: driverId,
        status: 'ASSIGNED'
      });
      
      // Refresh loads
      await loadData();
      
      setShowAssignModal(false);
      setSelectedLoadForAssignment(null);
    } catch (err) {
      console.error('Failed to assign load:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign load');
    }
  };

  const openAssignModal = (load: Load) => {
    setSelectedLoadForAssignment(load);
    setShowAssignModal(true);
  };

  const handleCreateLoad = async (newLoadData: any) => {
    try {
      await loadsApi.create(newLoadData);
      await loadData(); // Refresh the loads list
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create load:', err);
      setError(err instanceof Error ? err.message : 'Failed to create load');
    }
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV(loads);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (loads: Load[]) => {
    const headers = [
      'Load ID',
      'Status',
      'Created Date',
      'Service Address',
      'City',
      'State',
      'Contact',
      'Phone',
      'Assigned Driver',
      'Items Count',
      'Ship Via',
      'Notes'
    ];

    const rows = loads.map(load => [
      load.loadId,
      load.status,
      new Date(load.createdAt).toLocaleDateString(),
      load.serviceAddress.name,
      load.serviceAddress.city,
      load.serviceAddress.state,
      load.serviceAddress.contact,
      load.serviceAddress.phone,
      load.assignedDriverName || '',
      load.items.reduce((sum, item) => sum + item.qty, 0),
      load.shipVia || '',
      load.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  const getStatusColor = (status: Load['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'ASSIGNED': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'EN_ROUTE': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'DELIVERED': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'COMPLETED': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getDriverName = (driverId?: string) => {
    if (!driverId) return null;
    const driver = users.find(u => u.userId === driverId);
    return driver?.displayName || 'Unknown Driver';
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
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Loads ({loads.length})
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Export CSV
              </button>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Create Load
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
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
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="EN_ROUTE">En Route</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Driver
                  </label>
                  <select
                    value={filters.driverId}
                    onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Drivers</option>
                    {availableDrivers.map(driver => (
                      <option key={driver.userId} value={driver.userId}>
                        {driver.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    placeholder="Search loads..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setFilters({
                    status: '',
                    driverId: '',
                    searchQuery: '',
                    dateFrom: '',
                    dateTo: ''
                  })}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Admin Workflow Help */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Load Management</h3>
            <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <p><strong>PENDING:</strong> New loads waiting for driver assignment - click "Assign Driver" to assign</p>
              <p><strong>ASSIGNED:</strong> Assigned to driver - waiting for driver to start route</p>
              <p><strong>EN ROUTE:</strong> Driver is traveling to pickup/delivery location</p>
              <p><strong>DELIVERED:</strong> Driver has delivered - waiting for signature collection</p>
              <p><strong>COMPLETED:</strong> Load fully completed with signature</p>
            </div>
          </div>

          {/* Loads Table */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            {loads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No loads found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {Object.values(filters).some(v => v) 
                    ? 'Try adjusting your filters or create a new load.'
                    : 'Get started by creating your first load.'
                  }
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Create Load
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {loads.map((load) => (
                  <li key={load.loadId}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                                {load.loadId}
                              </p>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(load.status)}`}>
                                {load.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(load.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                📍 {load.serviceAddress.name} - {load.serviceAddress.city}, {load.serviceAddress.state}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-gray-500 sm:mt-0">
                              <div className="flex items-center space-x-4">
                                {load.assignedDriverId && (
                                  <p>👤 {getDriverName(load.assignedDriverId)}</p>
                                )}
                                <p>📦 {load.items.reduce((sum, item) => sum + item.qty, 0)} items</p>
                                {load.shipVia && <p>🚚 {load.shipVia}</p>}
                              </div>
                              <div className="flex space-x-2">
                                {load.status === 'PENDING' && (
                                  <button 
                                    onClick={() => openAssignModal(load)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                                  >
                                    Assign Driver
                                  </button>
                                )}
                                {(load.status === 'DELIVERED' || load.status === 'COMPLETED') && (
                                  <a
                                    href={loadsApi.getReceipt(load.loadId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                  >
                                    View Receipt
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <CreateLoadForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateLoad}
      />

      {/* Driver Assignment Modal */}
      {showAssignModal && selectedLoadForAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assign Driver</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{selectedLoadForAssignment.loadId}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedLoadForAssignment.serviceAddress.name} - {selectedLoadForAssignment.serviceAddress.city}, {selectedLoadForAssignment.serviceAddress.state}
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 dark:text-white">Select Driver:</h5>
                {availableDrivers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No drivers available. Create driver accounts first.</p>
                ) : (
                  availableDrivers.map(driver => (
                    <button
                      key={driver.userId}
                      onClick={() => handleAssignLoad(selectedLoadForAssignment.loadId, driver.userId)}
                      className="w-full text-left p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      👤 {driver.displayName} ({driver.email})
                    </button>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-gray-700 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
