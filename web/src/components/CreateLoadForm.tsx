import { useCreateLoadForm } from '../hooks/useCreateLoadForm';
import { CreateLoadFormProps } from '../types/load';
import { orgApi, trailersApi, docksApi, dockYardsApi } from '../lib/api';
import { useState, useEffect } from 'react';
import ServiceAddressForm from './forms/ServiceAddressForm';
import ItemsManager from './forms/ItemsManager';
import LoadAssignment from './forms/LoadAssignment';
import { Trailer, calculateCompliance } from '../types/trailer';
import { Dock, DockYard } from '../types/dock';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export default function CreateLoadForm({ isOpen, onClose, onSubmit }: CreateLoadFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [docks, setDocks] = useState<Dock[]>([]);
  const [dockYards, setDockYards] = useState<DockYard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrailerId, setSelectedTrailerId] = useState<string>('');
  const [selectedDockId, setSelectedDockId] = useState<string>('');
  const [manifest, setManifest] = useState<string>('');
  
  const {
    formData,
    handleAddressChange,
    handleItemChange,
    addItem,
    removeItem,
    handleDriverChange,
    handlePriorityChange,
    handleNotesChange,
    resetForm
  } = useCreateLoadForm();

  const drivers = users.filter(user => user.role === 'driver');

  // Load users and resources when form opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [usersResponse, trailersResponse, docksResponse, dockYardsResponse] = await Promise.all([
        orgApi.listUsers(),
        trailersApi.list(),
        docksApi.list(),
        dockYardsApi.list(),
      ]);
      setUsers(usersResponse.users || []);
      
      const trailersWithCompliance = (trailersResponse.trailers || []).map((t: Trailer) => ({
        ...t,
        compliance: calculateCompliance(t),
      }));
      setTrailers(trailersWithCompliance);
      setDocks(docksResponse.docks || []);
      setDockYards(dockYardsResponse.dockyards || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Create load data in API format
      const loadData = {
        serviceAddress: formData.serviceAddress,
        items: formData.items
          .filter(item => item.description.trim() !== '')
          .map((item, index) => ({
            id: `item-${index}`,
            description: item.description,
            qty: item.qty,
            unit: 'piece' // default unit
          })),
        assignedDriverId: formData.assignedDriverId || undefined,
        notes: formData.notes || undefined,
        priority: formData.priority,
        status: formData.assignedDriverId ? 'ASSIGNED' : 'PENDING',
        // New fields
        trailerId: selectedTrailerId || undefined,
        trailerLocationId: selectedDockId || undefined,
        dockYardId: selectedDockId ? docks.find(d => d.dockId === selectedDockId)?.dockYardId : undefined,
        manifest: manifest || undefined,
      };

      await onSubmit(loadData);
      resetForm();
      setSelectedTrailerId('');
      setSelectedDockId('');
      setManifest('');
      onClose();
    } catch (error) {
      console.error('Failed to create load:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Load</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ServiceAddressForm 
              serviceAddress={formData.serviceAddress}
              onChange={handleAddressChange}
            />

            {/* Trailer & Location Information */}
            <div className="border-t dark:border-gray-700 pt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Trailer & Location (Optional)
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trailer
                  </label>
                  <select
                    value={selectedTrailerId}
                    onChange={(e) => {
                      setSelectedTrailerId(e.target.value);
                      // Auto-populate dock from trailer's current location
                      if (e.target.value) {
                        const trailer = trailers.find(t => t.trailerId === e.target.value);
                        if (trailer?.currentDockId) {
                          setSelectedDockId(trailer.currentDockId);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a trailer</option>
                    {trailers
                      .filter(t => t.status === 'ACTIVE')
                      .map((trailer) => {
                        const dock = docks.find(d => d.dockId === trailer.currentDockId);
                        const locationText = dock ? ` - at ${dock.name}` : '';
                        return (
                          <option key={trailer.trailerId} value={trailer.trailerId}>
                            {trailer.trailerNumber} ({trailer.compliance}){locationText}
                          </option>
                        );
                      })}
                  </select>
                  {selectedTrailerId && (() => {
                    const trailer = trailers.find(t => t.trailerId === selectedTrailerId);
                    return trailer?.compliance === 'NEEDS_UPDATING' && (
                      <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Warning: This trailer needs updating (registration or inspection expired)
                      </p>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trailer Location (Dock)
                  </label>
                  <select
                    value={selectedDockId}
                    onChange={(e) => setSelectedDockId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a dock</option>
                    {docks.map((dock) => {
                      const dockYard = dockYards.find(dy => dy.dockYardId === dock.dockYardId);
                      return (
                        <option key={dock.dockId} value={dock.dockId}>
                          {dock.name} ({dock.dockType}) - {dockYard?.name || 'Unknown Yard'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Manifest
                  </label>
                  <textarea
                    value={manifest}
                    onChange={(e) => setManifest(e.target.value)}
                    rows={3}
                    placeholder="Description of items loaded on the trailer..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <ItemsManager
              items={formData.items}
              onItemChange={handleItemChange}
              onAddItem={addItem}
              onRemoveItem={removeItem}
            />

            <LoadAssignment 
              assignedDriverId={formData.assignedDriverId || ''}
              priority={formData.priority}
              notes={formData.notes || ''}
              drivers={drivers}
              onDriverChange={handleDriverChange}
              onPriorityChange={handlePriorityChange}
              onNotesChange={handleNotesChange}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Load'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}