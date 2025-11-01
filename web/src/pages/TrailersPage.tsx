import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../hooks/useUser';
import { trailersApi, docksApi } from '../lib/api';
import { Navigation } from '../components/Navigation';
import { Navigate } from 'react-router-dom';
import { Trailer, calculateCompliance } from '../types/trailer';
import { Dock } from '../types/dock';

export default function TrailersPage() {
  const { currentUser } = useUser();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [docks, setDocks] = useState<Dock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    trailerNumber: '',
    currentDockId: '',
    registrationExpiresAt: '',
    isRegistrationCurrent: false,
    inspectionExpiresAt: '',
    isInspectionCurrent: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'IN_REPAIR',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [trailersResponse, docksResponse] = await Promise.all([
        trailersApi.list(),
        docksApi.list(),
      ]);
      
      // Calculate compliance for each trailer
      const trailersWithCompliance = (trailersResponse.trailers || []).map((trailer: Trailer) => ({
        ...trailer,
        compliance: calculateCompliance(trailer),
      }));
      
      setTrailers(trailersWithCompliance);
      setDocks(docksResponse.docks || []);
    } catch (err) {
      console.error('Failed to load trailers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trailers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'coadmin')) {
      loadData();
    }
  }, [currentUser, loadData]);

  const resetForm = () => {
    setFormData({
      trailerNumber: '',
      currentDockId: '',
      registrationExpiresAt: '',
      isRegistrationCurrent: false,
      inspectionExpiresAt: '',
      isInspectionCurrent: false,
      status: 'ACTIVE',
    });
    setEditingTrailer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTrailer) {
        await trailersApi.update(editingTrailer.trailerId, formData);
      } else {
        await trailersApi.create(formData);
      }
      
      await loadData();
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save trailer:', err);
      setError(err instanceof Error ? err.message : 'Failed to save trailer');
    }
  };

  const handleEdit = (trailer: Trailer) => {
    setFormData({
      trailerNumber: trailer.trailerNumber,
      currentDockId: trailer.currentDockId || '',
      registrationExpiresAt: trailer.registrationExpiresAt || '',
      isRegistrationCurrent: trailer.isRegistrationCurrent,
      inspectionExpiresAt: trailer.inspectionExpiresAt || '',
      isInspectionCurrent: trailer.isInspectionCurrent,
      status: trailer.status,
    });
    setEditingTrailer(trailer);
    setShowCreateForm(true);
  };

  const getDockName = (dockId?: string) => {
    if (!dockId) return 'None';
    const dock = docks.find(d => d.dockId === dockId);
    return dock ? dock.name : dockId;
  };

  const getComplianceBadge = (compliance?: string) => {
    if (compliance === 'COMPLIANT') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Compliant</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Needs Updating</span>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      IN_REPAIR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[status as keyof typeof colors]}`}>{status.replace('_', ' ')}</span>;
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'coadmin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trailers ({trailers.length})
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Create Trailer
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button onClick={() => setError(null)} className="text-sm text-red-600 dark:text-red-400 underline mt-2">
                Dismiss
              </button>
            </div>
          )}

          {/* Trailers List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : trailers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚛</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trailers found</h3>
              <p className="text-gray-500 dark:text-gray-400">Get started by creating your first trailer.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trailer Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Inspection</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Compliance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {trailers.map((trailer) => (
                    <tr key={trailer.trailerId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {trailer.trailerNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getDockName(trailer.currentDockId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {trailer.registrationExpiresAt ? (
                          <div>
                            <div>{new Date(trailer.registrationExpiresAt).toLocaleDateString()}</div>
                            <div className="text-xs">{new Date(trailer.registrationExpiresAt) > new Date() ? '✓ Current' : '✗ Expired'}</div>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {trailer.inspectionExpiresAt ? (
                          <div>
                            <div>{new Date(trailer.inspectionExpiresAt).toLocaleDateString()}</div>
                            <div className="text-xs">{new Date(trailer.inspectionExpiresAt) > new Date() ? '✓ Current' : '✗ Expired'}</div>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getComplianceBadge(trailer.compliance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(trailer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(trailer)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingTrailer ? 'Edit Trailer' : 'Create New Trailer'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trailer Number *
                  </label>
                  <input
                    type="text"
                    value={formData.trailerNumber}
                    onChange={(e) => setFormData({ ...formData, trailerNumber: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Dock Location
                  </label>
                  <select
                    value={formData.currentDockId}
                    onChange={(e) => setFormData({ ...formData, currentDockId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">None</option>
                    {docks.map((dock) => (
                      <option key={dock.dockId} value={dock.dockId}>
                        {dock.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Registration Expires At
                    </label>
                    <input
                      type="date"
                      value={formData.registrationExpiresAt}
                      onChange={(e) => setFormData({ ...formData, registrationExpiresAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="regCurrent"
                      checked={formData.isRegistrationCurrent}
                      onChange={(e) => setFormData({ ...formData, isRegistrationCurrent: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="regCurrent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Registration is Current
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Inspection Expires At
                    </label>
                    <input
                      type="date"
                      value={formData.inspectionExpiresAt}
                      onChange={(e) => setFormData({ ...formData, inspectionExpiresAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inspCurrent"
                      checked={formData.isInspectionCurrent}
                      onChange={(e) => setFormData({ ...formData, isInspectionCurrent: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="inspCurrent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Inspection is Current
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="IN_REPAIR">In Repair</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {editingTrailer ? 'Update Trailer' : 'Create Trailer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
