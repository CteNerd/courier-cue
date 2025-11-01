import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../hooks/useUser';
import { docksApi, dockYardsApi } from '../lib/api';
import { Navigation } from '../components/Navigation';
import { Navigate } from 'react-router-dom';
import { Dock, DockYard } from '../types/dock';

export default function DocksPage() {
  const { currentUser } = useUser();
  const [docks, setDocks] = useState<Dock[]>([]);
  const [dockYards, setDockYards] = useState<DockYard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDock, setEditingDock] = useState<Dock | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    dockYardId: '',
    dockType: 'flatbed' as 'flatbed' | 'drop-in',
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [docksResponse, dockYardsResponse] = await Promise.all([
        docksApi.list(),
        dockYardsApi.list(),
      ]);
      setDocks(docksResponse.docks || []);
      setDockYards(dockYardsResponse.dockyards || []);
    } catch (err) {
      console.error('Failed to load docks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load docks');
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
    setFormData({ name: '', dockYardId: '', dockType: 'flatbed', notes: '' });
    setEditingDock(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDock) {
        await docksApi.update(editingDock.dockId, formData);
      } else {
        await docksApi.create(formData);
      }
      
      await loadData();
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save dock:', err);
      setError(err instanceof Error ? err.message : 'Failed to save dock');
    }
  };

  const handleEdit = (dock: Dock) => {
    setFormData({
      name: dock.name,
      dockYardId: dock.dockYardId,
      dockType: dock.dockType,
      notes: dock.notes || '',
    });
    setEditingDock(dock);
    setShowCreateForm(true);
  };

  const getDockYardName = (dockYardId: string) => {
    const dockYard = dockYards.find(dy => dy.dockYardId === dockYardId);
    return dockYard ? dockYard.name : dockYardId;
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'coadmin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Docks ({docks.length})
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Create Dock
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button onClick={() => setError(null)} className="text-sm text-red-600 dark:text-red-400 underline mt-2">
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : docks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚪</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No docks found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {dockYards.length === 0 
                  ? 'Create a dock yard first, then add docks to it.'
                  : 'Get started by creating your first dock.'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dock Yard</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {docks.map((dock) => (
                    <tr key={dock.dockId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {dock.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getDockYardName(dock.dockYardId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {dock.dockType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {dock.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(dock)}
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

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingDock ? 'Edit Dock' : 'Create New Dock'}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dock Yard *
                  </label>
                  <select
                    value={formData.dockYardId}
                    onChange={(e) => setFormData({ ...formData, dockYardId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a dock yard</option>
                    {dockYards.map((dockYard) => (
                      <option key={dockYard.dockYardId} value={dockYard.dockYardId}>
                        {dockYard.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dock Type *
                  </label>
                  <select
                    value={formData.dockType}
                    onChange={(e) => setFormData({ ...formData, dockType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="flatbed">Flatbed</option>
                    <option value="drop-in">Drop-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
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
                    {editingDock ? 'Update Dock' : 'Create Dock'}
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
