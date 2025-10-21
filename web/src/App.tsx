import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';
import { getLoadStats, getLoadsByStatus, getLoadsByDriver, Load } from './data/mockData';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import CreateLoadForm from './components/CreateLoadForm';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useState } from 'react';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a
              href="/loads"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Loads</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
            </a>
            <a
              href="/loads?status=pending"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </a>
            <a
              href="/loads?status=completed"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <p className="text-gray-600">Load management system is ready for development!</p>
            <p className="text-sm text-gray-500 mt-2">
              API Server: <span className="text-green-600">Running on localhost:3001</span>
            </p>
            <p className="text-sm text-gray-500">
              Database: <span className="text-green-600">Connected to local DynamoDB</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadsPage() {
  const { currentUser } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loads, setLoads] = useState(() => {
    return getLoadsByStatus('PENDING').concat(
      getLoadsByStatus('ASSIGNED'),
      getLoadsByStatus('EN_ROUTE'),
      getLoadsByStatus('DELIVERED'),
      getLoadsByStatus('COMPLETED')
    );
  });
  
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
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'EN_ROUTE': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED': return 'bg-orange-100 text-orange-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
            {currentUser.role !== 'driver' && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Create Load
              </button>
            )}
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
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            {load.assignedDriverName && (
                              <p>👤 {load.assignedDriverName}</p>
                            )}
                            <p className="ml-4">📦 {load.items.reduce((sum, item) => sum + item.qty, 0)} items</p>
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
    </div>
  );
}

function DriverLoadsPage() {
  const { currentUser } = useUser();
  
  if (!currentUser || currentUser.role !== 'driver') {
    return <Navigate to="/login" replace />;
  }

  const myLoads = getLoadsByDriver(currentUser.userId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Loads</h2>

          <div className="space-y-4">
            {myLoads.map((load) => (
              <div key={load.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{load.id}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{load.serviceAddress.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    load.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                    load.status === 'EN_ROUTE' ? 'bg-yellow-100 text-yellow-800' :
                    load.status === 'DELIVERED' ? 'bg-orange-100 text-orange-800' :
                    load.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {load.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm">
                      {load.serviceAddress.street}<br />
                      {load.serviceAddress.city}, {load.serviceAddress.state} {load.serviceAddress.zip}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-sm">
                      {load.serviceAddress.contact}<br />
                      {load.serviceAddress.phone}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {load.status === 'ASSIGNED' && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                      Start Route
                    </button>
                  )}
                  {load.status === 'EN_ROUTE' && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                      Mark Delivered
                    </button>
                  )}
                  {load.status === 'DELIVERED' && (
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">
                      Get Signature
                    </button>
                  )}
                  <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
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