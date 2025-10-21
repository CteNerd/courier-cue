import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';
import { getLoadStats, getLoadsByStatus, getLoadsByDriver, Load } from './data/mockData';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import CreateLoadForm from './components/CreateLoadForm';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useState, useEffect } from 'react';

function Navigation() {
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

function DashboardPage() {
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

function LoadsPage() {
  const { currentUser } = useUser();
  
  // Redirect drivers to their specific loads page
  if (!currentUser) return null;
  
  if (currentUser.role === 'driver') {
    window.location.href = '/driver/loads';
    return null;
  }

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLoadForAssignment, setSelectedLoadForAssignment] = useState<Load | null>(null);
  const [loads, setLoads] = useState(() => {
    return getLoadsByStatus('PENDING').concat(
      getLoadsByStatus('ASSIGNED'),
      getLoadsByStatus('EN_ROUTE'),
      getLoadsByStatus('DELIVERED'),
      getLoadsByStatus('COMPLETED')
    );
  });

  // Mock driver list - in real app this would come from API
  const availableDrivers = [
    { id: 'driver1-789', name: 'Driver Johnson' },
    { id: 'driver2-456', name: 'Driver Smith' },
    { id: 'driver3-123', name: 'Driver Brown' }
  ];

  const handleAssignLoad = (loadId: string, driverId: string, driverName: string) => {
    setLoads(prev => prev.map(load => 
      load.id === loadId 
        ? { ...load, status: 'ASSIGNED' as const, assignedDriverId: driverId, assignedDriverName: driverName }
        : load
    ));
    setShowAssignModal(false);
    setSelectedLoadForAssignment(null);
  };

  const openAssignModal = (load: Load) => {
    setSelectedLoadForAssignment(load);
    setShowAssignModal(true);
  };
  
  const urlParams = new URLSearchParams(window.location.search);
  const statusFilter = urlParams.get('status');
  
  let filteredLoads = loads;

  if (statusFilter === 'pending') {
    filteredLoads = loads.filter(load => ['PENDING', 'ASSIGNED', 'EN_ROUTE'].includes(load.status));
  } else if (statusFilter === 'completed') {
    filteredLoads = loads.filter(load => ['DELIVERED', 'COMPLETED'].includes(load.status));
  }

  const handleCreateLoad = (newLoad: any) => {
    setLoads(prev => [newLoad, ...prev]);
    console.log('New load created:', newLoad);
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

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Loads {statusFilter && `(${statusFilter})`}
            </h2>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Create Load
            </button>
          </div>

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

          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLoads.map((load) => (
                <li key={load.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                            {load.id}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(load.status)}`}>
                              {load.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              📍 {load.serviceAddress.name} - {load.serviceAddress.city}, {load.serviceAddress.state}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm text-gray-500 sm:mt-0">
                            <div className="flex items-center">
                              {load.assignedDriverName && (
                                <p>👤 {load.assignedDriverName}</p>
                              )}
                              <p className={load.assignedDriverName ? "ml-4" : ""}>📦 {load.items.reduce((sum, item) => sum + item.qty, 0)} items</p>
                            </div>
                            {load.status === 'PENDING' && (
                              <button 
                                onClick={() => openAssignModal(load)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Assign Driver
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{selectedLoadForAssignment.id}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedLoadForAssignment.serviceAddress.name} - {selectedLoadForAssignment.serviceAddress.city}, {selectedLoadForAssignment.serviceAddress.state}
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 dark:text-white">Select Driver:</h5>
                {availableDrivers.map(driver => (
                  <button
                    key={driver.id}
                    onClick={() => handleAssignLoad(selectedLoadForAssignment.id, driver.id, driver.name)}
                    className="w-full text-left p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    👤 {driver.name}
                  </button>
                ))}
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

function DriverLoadsPage() {
  const { currentUser } = useUser();
  const [myLoads, setMyLoads] = useState<Load[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  if (!currentUser || currentUser.role !== 'driver') {
    return <Navigate to="/login" replace />;
  }

  // Initialize loads on component mount
  useEffect(() => {
    setMyLoads(getLoadsByDriver(currentUser.userId));
  }, [currentUser.userId]);

  // Handle URL parameters for filtering
  const urlParams = new URLSearchParams(window.location.search);
  const statusFilter = urlParams.get('status');
  
  let filteredLoads = myLoads;
  if (statusFilter === 'pending') {
    filteredLoads = myLoads.filter(load => ['PENDING', 'ASSIGNED', 'EN_ROUTE'].includes(load.status));
  } else if (statusFilter === 'completed') {
    filteredLoads = myLoads.filter(load => ['DELIVERED', 'COMPLETED'].includes(load.status));
  }

  const handleStartRoute = (loadId: string) => {
    setMyLoads(prev => prev.map(load => 
      load.id === loadId 
        ? { ...load, status: 'EN_ROUTE' as const }
        : load
    ));
  };

  const handleMarkDelivered = (loadId: string) => {
    setMyLoads(prev => prev.map(load => 
      load.id === loadId 
        ? { ...load, status: 'DELIVERED' as const, deliveredAt: new Date().toISOString() }
        : load
    ));
  };

  const handleGetSignature = (loadId: string) => {
    // For now, just mark as completed - in real app would open signature capture
    setMyLoads(prev => prev.map(load => 
      load.id === loadId 
        ? { ...load, status: 'COMPLETED' as const, signatureUrl: 'mock-signature-url' }
        : load
    ));
  };

  const handleViewDetails = (load: Load) => {
    setSelectedLoad(load);
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            My Loads {statusFilter && `(${statusFilter})`}
          </h2>

          {/* Workflow Help */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Load Workflow</h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>PENDING:</strong> Load created by admin, waiting for assignment</p>
              <p><strong>ASSIGNED:</strong> Load assigned to you - click "Start Route" to begin</p>
              <p><strong>EN ROUTE:</strong> You're traveling to pickup/delivery - click "Mark Delivered" when complete</p>
              <p><strong>DELIVERED:</strong> Load delivered - click "Get Signature" to finalize</p>
              <p><strong>COMPLETED:</strong> Load fully completed with signature</p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredLoads.map((load) => (
              <div key={load.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{load.id}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{load.serviceAddress.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    load.status === 'ASSIGNED' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                    load.status === 'EN_ROUTE' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    load.status === 'DELIVERED' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                    load.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
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
                      {load.serviceAddress.phone}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {load.status === 'ASSIGNED' && (
                    <button 
                      onClick={() => handleStartRoute(load.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                      Start Route
                    </button>
                  )}
                  {load.status === 'EN_ROUTE' && (
                    <button 
                      onClick={() => handleMarkDelivered(load.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {load.status === 'DELIVERED' && (
                    <button 
                      onClick={() => handleGetSignature(load.id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
                    >
                      Get Signature
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewDetails(load)}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Load Details Modal */}
      {showDetails && selectedLoad && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Load Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedLoad.id}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status: <span className={`font-medium ${
                      selectedLoad.status === 'ASSIGNED' ? 'text-blue-600' :
                      selectedLoad.status === 'EN_ROUTE' ? 'text-yellow-600' :
                      selectedLoad.status === 'DELIVERED' ? 'text-orange-600' :
                      selectedLoad.status === 'COMPLETED' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {selectedLoad.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Service Address</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium">{selectedLoad.serviceAddress.name}</p>
                    <p>{selectedLoad.serviceAddress.street}</p>
                    <p>{selectedLoad.serviceAddress.city}, {selectedLoad.serviceAddress.state} {selectedLoad.serviceAddress.zip}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>Contact: {selectedLoad.serviceAddress.contact}</p>
                    <p>Phone: {selectedLoad.serviceAddress.phone}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Items</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedLoad.items.map((item, index) => (
                      <p key={index}>{item.qty}x {item.type}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>Created: {new Date(selectedLoad.createdAt).toLocaleString()}</p>
                    {selectedLoad.deliveredAt && (
                      <p>Delivered: {new Date(selectedLoad.deliveredAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-gray-700 mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  console.log('App rendering...');
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/loads" element={<LoadsPage />} />
      <Route path="/driver/loads" element={<DriverLoadsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;