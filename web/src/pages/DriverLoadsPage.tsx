import { useUser } from '../hooks/useUser';
import { getLoadsByDriver, Load } from '../data/mockData';
import { Navigation } from '../components/Navigation';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function DriverLoadsPage() {
  const { currentUser } = useUser();
  const [myLoads, setMyLoads] = useState<Load[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Initialize loads on component mount
  useEffect(() => {
    if (currentUser) {
      setMyLoads(getLoadsByDriver(currentUser.userId));
    }
  }, [currentUser]);
  
  if (!currentUser || currentUser.role !== 'driver') {
    return <Navigate to="/login" replace />;
  }

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
