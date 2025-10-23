import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../hooks/useUser';
import { loadsApi } from '../lib/api';
import { Navigation } from '../components/Navigation';
import SignatureCanvas from '../components/SignatureCanvas';
import { Load } from '../data/mockData';

interface UserWithId {
  userId: string;
  role: string;
}

export default function LoadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const loadLoadDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadData = await loadsApi.get(id!) as Load;
      setLoad(loadData);
    } catch (err) {
      console.error('Failed to load load details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load load details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadLoadDetails();
    }
  }, [id, loadLoadDetails]);

  const handleStatusUpdate = async (action: 'IN_TRANSIT' | 'DELIVERED') => {
    if (!load || !currentUser) return;

    // Check authorization - only assigned driver can update status
    if (currentUser.role === 'driver' && load.assignedDriverId !== (currentUser as UserWithId).userId) {
      setError('You can only update loads assigned to you');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await loadsApi.updateStatus(load.id, action);
      await loadLoadDetails(); // Refresh load data
      
      // If delivered, show signature capture
      if (action === 'DELIVERED') {
        setShowSignature(true);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignatureComplete = async (success: boolean) => {
    setShowSignature(false);
    
    if (success) {
      await loadLoadDetails(); // Refresh to get updated status
      
      // Send email notification
      try {
        await loadsApi.sendEmail(load!.id);
      } catch (err) {
        console.warn('Failed to send receipt email:', err);
      }
    }
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

  const getNextActionButton = () => {
    if (!load || updating) return null;

    const isDriver = currentUser?.role === 'driver';
    const isAssignedDriver = isDriver && load.assignedDriverId === (currentUser as UserWithId)?.userId;

    switch (load.status) {
      case 'ASSIGNED':
        if (isAssignedDriver) {
          return (
            <button
              onClick={() => handleStatusUpdate('IN_TRANSIT')}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {updating ? 'Starting...' : 'Start Route'}
            </button>
          );
        }
        break;
      
      case 'EN_ROUTE':
        if (isAssignedDriver) {
          return (
            <button
              onClick={() => handleStatusUpdate('DELIVERED')}
              disabled={updating}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {updating ? 'Marking Delivered...' : 'Mark as Delivered'}
            </button>
          );
        }
        break;
      
      case 'DELIVERED':
        if (isAssignedDriver && !load.signatureKey) {
          return (
            <button
              onClick={() => setShowSignature(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Capture Signature
            </button>
          );
        }
        break;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !load) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              {error || 'Load not found'}
            </h3>
            <div className="mt-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Load Details
              </h2>
              <div className="flex items-center mt-2 space-x-3">
                <p className="text-lg text-gray-600 dark:text-gray-400">ID: {load.id}</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(load.status)}`}>
                  {load.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {getNextActionButton()}
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Back
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

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Service Address
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                      {load.serviceAddress.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {load.serviceAddress.street}<br />
                      {load.serviceAddress.city}, {load.serviceAddress.state} {load.serviceAddress.zip}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">Contact</h5>
                    <p className="text-gray-600 dark:text-gray-400">{load.serviceAddress.contact}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <a href={`tel:${load.serviceAddress.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {load.serviceAddress.phone}
                      </a>
                    </p>
                    {load.serviceAddress.email && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <a href={`mailto:${load.serviceAddress.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {load.serviceAddress.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">Load Information</h5>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                      <p>Created: {new Date(load.createdAt).toLocaleString()}</p>
                      <p>Updated: {new Date(load.updatedAt || load.createdAt).toLocaleString()}</p>
                      {load.shipVia && <p>Ship Via: {load.shipVia}</p>}
                      {load.unloadLocation && <p>Unload Location: {load.unloadLocation}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Items</h5>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-2">
                    {load.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-900 dark:text-white">{item.type}</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Qty: {item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-gray-900 dark:text-white">Total Items:</span>
                      <span className="text-gray-900 dark:text-white">
                        {load.items.reduce((sum, item) => sum + item.qty, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {load.notes && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Notes</h5>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{load.notes}</p>
                  </div>
                </div>
              )}

              {/* Receipt Download */}
              {(load.status === 'COMPLETED' || load.receiptPdfKey) && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Receipt</h5>
                  <div className="flex space-x-3">
                    <a
                      href={loadsApi.getReceipt(load.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Download Receipt PDF
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          await loadsApi.sendEmail(load.id);
                          alert('Receipt email sent successfully');
                        } catch (err) {
                          alert('Failed to send email: ' + (err instanceof Error ? err.message : 'Unknown error'));
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Resend Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Signature Canvas Modal */}
      {showSignature && (
        <SignatureCanvas
          loadId={load.id}
          shipperName={load.serviceAddress.contact}
          onSignatureComplete={handleSignatureComplete}
          onClose={() => setShowSignature(false)}
        />
      )}
    </div>
  );
}
