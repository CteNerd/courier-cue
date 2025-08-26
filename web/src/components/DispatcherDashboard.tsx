import React, { useState, useEffect } from 'react';
import { apiService, Order, Driver } from '../services/api';
import SignatureDisplay from './SignatureDisplay';

interface DispatcherDashboardProps {
  onSignOut: () => void;
}

const DispatcherDashboard: React.FC<DispatcherDashboardProps> = ({ onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'OPEN' | 'ASSIGNED' | 'ENROUTE' | 'COMPLETED'>('OPEN');
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadOrders();
    loadDrivers();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getOrders(activeTab);
      if (response.error) {
        setError(response.message || response.error);
      } else {
        setOrders(response.data?.orders || []);
      }
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await apiService.getDrivers();
      if (!response.error) {
        setDrivers(response.data?.drivers || []);
      }
    } catch (err) {
      console.error('Failed to load drivers:', err);
    }
  };

  const handleCreateOrder = async (orderData: Partial<Order>) => {
    try {
      const response = await apiService.createOrder(orderData);
      if (response.error) {
        setError(response.message || response.error);
      } else {
        setShowCreateOrder(false);
        if (activeTab === 'OPEN') {
          loadOrders();
        }
      }
    } catch (err) {
      setError('Failed to create order');
    }
  };

  const handleAssignOrder = async (orderId: string, driverId: string) => {
    try {
      const response = await apiService.assignOrder(orderId, driverId);
      if (response.error) {
        setError(response.message || response.error);
      } else {
        setShowAssignModal(false);
        setSelectedOrder(null);
        loadOrders();
        loadDrivers();
      }
    } catch (err) {
      setError('Failed to assign order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await apiService.cancelOrder(orderId);
      if (response.error) {
        setError(response.message || response.error);
      } else {
        loadOrders();
        loadDrivers();
      }
    } catch (err) {
      setError('Failed to cancel order');
    }
  };

  const getNavLink = (url: string) => {
    const encodedAddress = encodeURIComponent(url);
    return `https://maps.google.com/?q=${encodedAddress}`;
  };

  return (
    <div className="dispatcher-dashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Dispatcher Dashboard</h1>
        <div>
          <button
            onClick={() => setShowCreateOrder(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Create Order
          </button>
          <button
            onClick={onSignOut}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {/* Status Tabs */}
      <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
        {(['OPEN', 'ASSIGNED', 'ENROUTE', 'COMPLETED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === status ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === status ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {status} ({orders.length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              No {activeTab.toLowerCase()} orders
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {orders.map(order => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  drivers={drivers}
                  onAssign={() => {
                    setSelectedOrder(order);
                    setShowAssignModal(true);
                  }}
                  onCancel={() => handleCancelOrder(order.orderId)}
                  onNavigate={getNavLink}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateOrder && (
        <CreateOrderModal
          onClose={() => setShowCreateOrder(false)}
          onSubmit={handleCreateOrder}
        />
      )}

      {/* Assign Order Modal */}
      {showAssignModal && selectedOrder && (
        <AssignOrderModal
          order={selectedOrder}
          drivers={drivers}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedOrder(null);
          }}
          onAssign={handleAssignOrder}
        />
      )}
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  drivers: Driver[];
  onAssign: () => void;
  onCancel: () => void;
  onNavigate: (address: string) => string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, drivers, onAssign, onCancel, onNavigate }) => {
  const assignedDriver = drivers.find(d => d.driverId === order.assignedTo);

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0' }}>Order {order.orderId}</h3>
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            backgroundColor: getStatusColor(order.status),
            color: 'white'
          }}>
            {order.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {order.status === 'OPEN' && (
            <button
              onClick={onAssign}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Assign
            </button>
          )}
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button
              onClick={onCancel}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
        <div>
          <strong>Pickup:</strong>
          <div>{order.pickup.address}</div>
          <a
            href={onNavigate(order.pickup.address)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', fontSize: '12px' }}
          >
            Navigate
          </a>
        </div>
        <div>
          <strong>Delivery:</strong>
          <div>{order.delivery.address}</div>
          <a
            href={onNavigate(order.delivery.address)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', fontSize: '12px' }}
          >
            Navigate
          </a>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Load:</strong> {order.load.description}
        {order.load.weight && <span> ({order.load.weight} lbs)</span>}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Recipient:</strong> {order.recipientName}
      </div>

      {assignedDriver && (
        <div style={{ marginBottom: '12px' }}>
          <strong>Driver:</strong> {assignedDriver.name} ({assignedDriver.phone})
        </div>
      )}

      {order.signature && (
        <div>
          <strong>Signature:</strong>
          <div style={{ marginTop: '8px' }}>
            <SignatureDisplay signature={order.signature} width={300} height={150} />
          </div>
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
        Created: {new Date(order.createdAt).toLocaleString()}
        {order.assignedAt && <> • Assigned: {new Date(order.assignedAt).toLocaleString()}</>}
        {order.deliveredAt && <> • Delivered: {new Date(order.deliveredAt).toLocaleString()}</>}
      </div>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN': return '#6b7280';
    case 'ASSIGNED': return '#f59e0b';
    case 'ENROUTE': return '#3b82f6';
    case 'COMPLETED': return '#10b981';
    case 'CANCELLED': return '#ef4444';
    default: return '#6b7280';
  }
}

// Create Order Modal Component
interface CreateOrderModalProps {
  onClose: () => void;
  onSubmit: (orderData: Partial<Order>) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    pickup: { address: '', scheduledTime: '', contact: '' },
    delivery: { address: '', scheduledTime: '', contact: '' },
    load: { description: '', weight: '', instructions: '' },
    recipientName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      pickup: {
        address: formData.pickup.address,
        scheduledTime: formData.pickup.scheduledTime || undefined,
        contact: formData.pickup.contact || undefined
      },
      delivery: {
        address: formData.delivery.address,
        scheduledTime: formData.delivery.scheduledTime || undefined,
        contact: formData.delivery.contact || undefined
      },
      load: {
        description: formData.load.description,
        weight: formData.load.weight ? parseFloat(formData.load.weight) : undefined,
        instructions: formData.load.instructions || undefined
      },
      recipientName: formData.recipientName
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0 }}>Create New Order</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <h3>Pickup Information</h3>
            <input
              type="text"
              placeholder="Pickup Address *"
              value={formData.pickup.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pickup: { ...prev.pickup, address: e.target.value }
              }))}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="datetime-local"
              placeholder="Scheduled Time"
              value={formData.pickup.scheduledTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pickup: { ...prev.pickup, scheduledTime: e.target.value }
              }))}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Contact Information"
              value={formData.pickup.contact}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pickup: { ...prev.pickup, contact: e.target.value }
              }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3>Delivery Information</h3>
            <input
              type="text"
              placeholder="Delivery Address *"
              value={formData.delivery.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                delivery: { ...prev.delivery, address: e.target.value }
              }))}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="datetime-local"
              placeholder="Scheduled Time"
              value={formData.delivery.scheduledTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                delivery: { ...prev.delivery, scheduledTime: e.target.value }
              }))}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Contact Information"
              value={formData.delivery.contact}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                delivery: { ...prev.delivery, contact: e.target.value }
              }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3>Load Information</h3>
            <input
              type="text"
              placeholder="Load Description *"
              value={formData.load.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                load: { ...prev.load, description: e.target.value }
              }))}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
              type="number"
              placeholder="Weight (lbs)"
              value={formData.load.weight}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                load: { ...prev.load, weight: e.target.value }
              }))}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <textarea
              placeholder="Special Instructions"
              value={formData.load.instructions}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                load: { ...prev.load, instructions: e.target.value }
              }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '60px' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Recipient Name *"
              value={formData.recipientName}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assign Order Modal Component
interface AssignOrderModalProps {
  order: Order;
  drivers: Driver[];
  onClose: () => void;
  onAssign: (orderId: string, driverId: string) => void;
}

const AssignOrderModal: React.FC<AssignOrderModalProps> = ({ order, drivers, onClose, onAssign }) => {
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const availableDrivers = drivers.filter(driver => !driver.activeOrderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDriverId) {
      onAssign(order.orderId, selectedDriverId);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '500px'
      }}>
        <h2 style={{ marginTop: 0 }}>Assign Order {order.orderId}</h2>
        
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          <div><strong>Pickup:</strong> {order.pickup.address}</div>
          <div><strong>Delivery:</strong> {order.delivery.address}</div>
          <div><strong>Load:</strong> {order.load.description}</div>
        </div>

        {availableDrivers.length === 0 ? (
          <div style={{ color: '#ef4444', marginBottom: '16px' }}>
            No available drivers. All drivers have active orders.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Select Driver:
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              >
                <option value="">Choose a driver...</option>
                {availableDrivers.map(driver => (
                  <option key={driver.driverId} value={driver.driverId}>
                    {driver.name} - {driver.phone}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedDriverId}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedDriverId ? '#10b981' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selectedDriverId ? 'pointer' : 'not-allowed'
                }}
              >
                Assign Order
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DispatcherDashboard;