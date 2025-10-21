export interface Load {
  id: string;
  serviceAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    contact: string;
    phone: string;
  };
  status: 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'COMPLETED';
  assignedDriverId?: string;
  assignedDriverName?: string;
  items: Array<{
    type: string;
    qty: number;
  }>;
  createdAt: string;
  deliveredAt?: string;
  signatureUrl?: string;
}

export const MOCK_LOADS: Load[] = [
  {
    id: 'load-001',
    status: 'PENDING',
    serviceAddress: {
      name: 'ACME Distribution',
      street: '123 Industrial Blvd',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      contact: 'John Smith',
      phone: '555-0123',
    },
    items: [{ type: 'USED_48x40_CORE', qty: 2 }],
    createdAt: '2025-10-20T10:00:00Z',
  },
  {
    id: 'load-002',
    status: 'ASSIGNED',
    assignedDriverId: 'driver1-789',
    assignedDriverName: 'Driver Johnson',
    serviceAddress: {
      name: 'XYZ Logistics',
      street: '456 Commerce Way',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      contact: 'Sarah Wilson',
      phone: '555-0456',
    },
    items: [{ type: 'NEW_48x40_STANDARD', qty: 5 }],
    createdAt: '2025-10-20T09:30:00Z',
  },
  {
    id: 'load-003',
    status: 'EN_ROUTE',
    assignedDriverId: 'driver1-789',
    assignedDriverName: 'Driver Johnson',
    serviceAddress: {
      name: 'Fast Ship Co',
      street: '789 Logistics Lane',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
      contact: 'Mike Brown',
      phone: '555-0789',
    },
    items: [{ type: 'USED_40x32_CORE', qty: 3 }],
    createdAt: '2025-10-20T08:00:00Z',
  },
  {
    id: 'load-004',
    status: 'DELIVERED',
    assignedDriverId: 'driver2-101',
    assignedDriverName: 'Driver Smith',
    serviceAddress: {
      name: 'Quick Transport',
      street: '321 Delivery Dr',
      city: 'San Antonio',
      state: 'TX',
      zip: '78201',
      contact: 'Lisa Davis',
      phone: '555-0321',
    },
    items: [{ type: 'NEW_48x40_PREMIUM', qty: 1 }],
    createdAt: '2025-10-19T14:00:00Z',
    deliveredAt: '2025-10-20T12:30:00Z',
  },
  {
    id: 'load-005',
    status: 'COMPLETED',
    assignedDriverId: 'driver2-101',
    assignedDriverName: 'Driver Smith',
    serviceAddress: {
      name: 'Global Shipping',
      street: '654 Port Blvd',
      city: 'Galveston',
      state: 'TX',
      zip: '77550',
      contact: 'Tom Garcia',
      phone: '555-0654',
    },
    items: [{ type: 'USED_48x40_CORE', qty: 4 }],
    createdAt: '2025-10-19T10:00:00Z',
    deliveredAt: '2025-10-19T16:45:00Z',
    signatureUrl: '/signatures/load-005.png',
  },
  // Add more loads for demo
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `load-${String(i + 6).padStart(3, '0')}`,
    status: ['PENDING', 'ASSIGNED', 'COMPLETED'][i % 3] as Load['status'],
    assignedDriverId: i % 2 === 0 ? 'driver1-789' : 'driver2-101',
    assignedDriverName: i % 2 === 0 ? 'Driver Johnson' : 'Driver Smith',
    serviceAddress: {
      name: `Customer ${i + 6}`,
      street: `${100 + i} Business St`,
      city: ['Dallas', 'Houston', 'Austin'][i % 3],
      state: 'TX',
      zip: `7${String(i).padStart(4, '0')}`,
      contact: `Contact ${i + 6}`,
      phone: `555-${String(i + 100).padStart(4, '0')}`,
    },
    items: [{ type: 'USED_48x40_CORE', qty: i + 1 }],
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    ...(i % 3 === 2 && {
      deliveredAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
      signatureUrl: `/signatures/load-${String(i + 6).padStart(3, '0')}.png`,
    }),
  })),
];

export function getLoadsByStatus(status: Load['status']): Load[] {
  return MOCK_LOADS.filter(load => load.status === status);
}

export function getLoadsByDriver(driverId: string): Load[] {
  return MOCK_LOADS.filter(load => load.assignedDriverId === driverId);
}

export function getLoadStats() {
  const statusCounts = MOCK_LOADS.reduce((acc, load) => {
    acc[load.status] = (acc[load.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: MOCK_LOADS.length,
    pending: (statusCounts.PENDING || 0) + (statusCounts.ASSIGNED || 0) + (statusCounts.EN_ROUTE || 0),
    completed: (statusCounts.DELIVERED || 0) + (statusCounts.COMPLETED || 0),
    byStatus: statusCounts,
  };
}