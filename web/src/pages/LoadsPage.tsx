import { useUser } from '../hooks/useUser';
import { getLoadsByStatus, Load } from '../data/mockData';
import CreateLoadForm from '../components/CreateLoadForm';
import { Navigation } from '../components/Navigation';
import { useState } from 'react';

export default function LoadsPage() {
  const { currentUser } = useUser();
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
  
  // Redirect drivers to their specific loads page
  if (!currentUser) return null;
  
  if (currentUser.role === 'driver') {
    window.location.href = '/driver/loads';
    return null;
  }

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
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs ml-4"
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
