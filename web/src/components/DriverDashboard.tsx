import React, { useState, useEffect } from 'react';
import { apiService, Order, Driver } from '../services/api';
import SignatureCapture from './SignatureCapture';

interface DriverDashboardProps {
  onSignOut: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ onSignOut }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadDriverProfile();
    loadRecentOrders();
  }, []);

  const loadDriverProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getDriverProfile();
      if (response.error) {
        setError(response.message || response.error);
      } else {
        setDriver(response.data?.driver || null);
        setActiveOrder(response.data?.activeOrder || null);
      }
    } catch (err) {
      setError('Failed to load driver profile');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await apiService.getOrders('COMPLETED');
      if (!response.error) {
        // Show only the last 5 completed orders
        setRecentOrders((response.data?.orders || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load recent orders:', err);
    }
  };

  const handleStartDelivery = async () => {
    if (!activeOrder) return;

    try {
      const response = await apiService.startDelivery(activeOrder.orderId);
      if (response.error) {
        setError(response.message || response.error);
      } else {
        setActiveOrder(response.data || null);
      }
    } catch (err) {
      setError('Failed to start delivery');
    }
  };

  const handleCompleteDelivery = async (completionData: {
    recipientName: string;
    signature: { strokes: Array<Array<{ x: number; y: number }>>; isEmpty: boolean };
  }) => {
    if (!activeOrder) return;

    if (completionData.signature.isEmpty) {
      setError('Recipient signature is required');
      return;
    }

    try {
      const response = await apiService.completeDelivery(activeOrder.orderId, {
        recipientName: completionData.recipientName,
        signature: {
          strokes: completionData.signature.strokes,
          timestamp: new Date().toISOString(),
          recipientName: completionData.recipientName
        }
      });

      if (response.error) {
        setError(response.message || response.error);
      } else {
        setShowCompleteModal(false);
        setActiveOrder(null);
        loadRecentOrders();
      }
    } catch (err) {
      setError('Failed to complete delivery');
    }
  };

  const handleUpdateProfile = async (updates: Partial<Driver>) => {
    try {
      const response = await apiService.updateDriverProfile(updates);
      if (response.error) {
        setError(response.message || response.error);
      } else {
        setDriver(response.data || null);
        setShowProfileModal(false);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const getNavLink = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://maps.google.com/?q=${encodedAddress}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading driver dashboard...</div>
      </div>
    );
  }

  return (
    <div className="driver-dashboard" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Driver Dashboard</h1>
        <div>
          <button
            onClick={() => setShowProfileModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            Profile
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

      {driver && (
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Welcome, {driver.name}!</h3>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Phone: {driver.phone} • Driver ID: {driver.driverId}
          </div>
        </div>
      )}

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

      {/* Active Order Section */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Active Load</h2>
        {activeOrder ? (
          <ActiveOrderCard
            order={activeOrder}
            onStart={handleStartDelivery}
            onComplete={() => setShowCompleteModal(true)}
            onNavigate={getNavLink}
          />
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            <h3>No Active Load</h3>
            <p>You are available for the next assignment.</p>
          </div>
        )}
      </div>

      {/* Recent Orders Section */}
      <div>
        <h2>Recent Deliveries</h2>
        {recentOrders.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            No recent deliveries
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {recentOrders.map(order => (
              <RecentOrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Complete Delivery Modal */}
      {showCompleteModal && activeOrder && (
        <CompleteDeliveryModal
          order={activeOrder}
          onClose={() => setShowCompleteModal(false)}
          onComplete={handleCompleteDelivery}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && driver && (
        <ProfileModal
          driver={driver}
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
};

interface ActiveOrderCardProps {
  order: Order;
  onStart: () => void;
  onComplete: () => void;
  onNavigate: (address: string) => string;
}

const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({ order, onStart, onComplete, onNavigate }) => {
  const canStart = order.status === 'ASSIGNED';
  const canComplete = order.status === 'ENROUTE';

  return (
    <div style={{
      border: '2px solid #10b981',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0' }}>Order {order.orderId}</h3>
          <span style={{
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            backgroundColor: getStatusColor(order.status),
            color: 'white'
          }}>
            {order.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canStart && (
            <button
              onClick={onStart}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Start Delivery
            </button>
          )}
          {canComplete && (
            <button
              onClick={onComplete}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Complete Delivery
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          border: '1px solid #fbbf24'
        }}>
          <strong style={{ color: '#92400e' }}>📍 Pickup</strong>
          <div style={{ marginTop: '4px' }}>{order.pickup.address}</div>
          {order.pickup.contact && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Contact: {order.pickup.contact}</div>
          )}
          <a
            href={onNavigate(order.pickup.address)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            Navigate
          </a>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#dcfce7',
          borderRadius: '6px',
          border: '1px solid #10b981'
        }}>
          <strong style={{ color: '#065f46' }}>🎯 Delivery</strong>
          <div style={{ marginTop: '4px' }}>{order.delivery.address}</div>
          {order.delivery.contact && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Contact: {order.delivery.contact}</div>
          )}
          <a
            href={onNavigate(order.delivery.address)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            Navigate
          </a>
        </div>
      </div>

      <div style={{
        padding: '12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        marginBottom: '12px'
      }}>
        <strong>📦 Load Details</strong>
        <div style={{ marginTop: '4px' }}>{order.load.description}</div>
        {order.load.weight && <div style={{ fontSize: '12px', color: '#6b7280' }}>Weight: {order.load.weight} lbs</div>}
        {order.load.instructions && (
          <div style={{ marginTop: '4px', fontSize: '12px', fontStyle: 'italic' }}>
            Instructions: {order.load.instructions}
          </div>
        )}
      </div>

      <div style={{ fontSize: '14px', color: '#6b7280' }}>
        <strong>Recipient:</strong> {order.recipientName}
      </div>

      {order.assignedAt && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          Assigned: {new Date(order.assignedAt).toLocaleString()}
          {order.startedAt && <> • Started: {new Date(order.startedAt).toLocaleString()}</>}
        </div>
      )}
    </div>
  );
};

interface RecentOrderCardProps {
  order: Order;
}

const RecentOrderCard: React.FC<RecentOrderCardProps> = ({ order }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '12px',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>Order {order.orderId}</span>
        <span style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          backgroundColor: '#10b981',
          color: 'white'
        }}>
          COMPLETED
        </span>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        {order.pickup.address} → {order.delivery.address}
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        Delivered: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'N/A'}
      </div>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'ASSIGNED': return '#f59e0b';
    case 'ENROUTE': return '#3b82f6';
    case 'COMPLETED': return '#10b981';
    default: return '#6b7280';
  }
}

// Complete Delivery Modal
interface CompleteDeliveryModalProps {
  order: Order;
  onClose: () => void;
  onComplete: (data: {
    recipientName: string;
    signature: { strokes: Array<Array<{ x: number; y: number }>>; isEmpty: boolean };
  }) => void;
}

const CompleteDeliveryModal: React.FC<CompleteDeliveryModalProps> = ({ order, onClose, onComplete }) => {
  const [recipientName, setRecipientName] = useState(order.recipientName || '');
  const [signature, setSignature] = useState<{ strokes: Array<Array<{ x: number; y: number }>>; isEmpty: boolean }>({
    strokes: [],
    isEmpty: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      alert('Recipient name is required');
      return;
    }
    if (signature.isEmpty) {
      alert('Recipient signature is required');
      return;
    }
    onComplete({ recipientName: recipientName.trim(), signature });
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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0 }}>Complete Delivery</h2>
        
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          <div><strong>Order:</strong> {order.orderId}</div>
          <div><strong>Delivery:</strong> {order.delivery.address}</div>
          <div><strong>Load:</strong> {order.load.description}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Recipient Name: *
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Recipient Signature: *
            </label>
            <SignatureCapture
              onSignatureChange={setSignature}
              width={450}
              height={200}
            />
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Please ask the recipient to sign above
            </div>
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
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Complete Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Profile Modal
interface ProfileModalProps {
  driver: Driver;
  onClose: () => void;
  onUpdate: (updates: Partial<Driver>) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ driver, onClose, onUpdate }) => {
  const [name, setName] = useState(driver.name || '');
  const [phone, setPhone] = useState(driver.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ name: name.trim(), phone: phone.trim() });
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
        width: '400px'
      }}>
        <h2 style={{ marginTop: 0 }}>Update Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Name: *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Phone: *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            <div><strong>Email:</strong> {driver.email}</div>
            <div><strong>Driver ID:</strong> {driver.driverId}</div>
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
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverDashboard;