import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../hooks/useUser';
import { dockYardsApi } from '../lib/api';
import { Navigation } from '../components/Navigation';
import { Navigate } from 'react-router-dom';
import { DockYard } from '../types/dock';

export default function DockYardsPage() {
  const { currentUser } = useUser();
  const [dockYards, setDockYards] = useState<DockYard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDockYard, setEditingDockYard] = useState<DockYard | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dockYardsApi.list();
      setDockYards(response.dockyards || []);
    } catch (err) {
      console.error('Failed to load dock yards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dock yards');
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
    setFormData({ name: '', address: '' });
    setEditingDockYard(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDockYard) {
        await dockYardsApi.update(editingDockYard.dockYardId, formData);
      } else {
        await dockYardsApi.create(formData);
      }
      
      await loadData();
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save dock yard:', err);
      setError(err instanceof Error ? err.message : 'Failed to save dock yard');
    }
  };

  const handleEdit = (dockYard: DockYard) => {
    setFormData({
      name: dockYard.name,
      address: dockYard.address || '',
    });
    setEditingDockYard(dockYard);
    setShowCreateForm(true);
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
              Dock Yards ({dockYards.length})
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Create Dock Yard
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
          ) : dockYards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏭</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No dock yards found</h3>
              <p className="text-gray-500 dark:text-gray-400">Get started by creating your first dock yard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dockYards.map((dockYard) => (
                <div key={dockYard.dockYardId} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {dockYard.name}
                    </h3>
                    <button
                      onClick={() => handleEdit(dockYard)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  {dockYard.address && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                      {dockYard.address}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                    Created {new Date(dockYard.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
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
                  {editingDockYard ? 'Edit Dock Yard' : 'Create New Dock Yard'}
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
                    Address (Optional)
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                    {editingDockYard ? 'Update Dock Yard' : 'Create Dock Yard'}
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
