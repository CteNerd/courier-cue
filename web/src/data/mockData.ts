export interface Load {
  id: string;
  loadId?: string; // For backend compatibility
  serviceAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    contact: string;
    phone: string;
    email?: string;
  };
  status: 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'COMPLETED';
  assignedDriverId?: string;
  assignedDriverName?: string;
  items: Array<{
    type: string;
    qty: number;
  }>;
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
  signatureUrl?: string;
  signatureKey?: string;
  receiptPdfKey?: string;
  notes?: string;
  unloadLocation?: string;
  shipVia?: string;
}

export const MOCK_LOADS: Load[] = [
  {
    id: 'load-001',
    loadId: 'load-001',
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
    loadId: 'load-002',
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
    loadId: 'load-003',
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
    loadId: 'load-004',
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

// Mock Dock Yards
export const MOCK_DOCK_YARDS = [
  {
    dockYardId: 'dy-001',
    name: 'Dallas Distribution Center',
    address: '5000 Distribution Parkway, Dallas, TX 75201',
    orgId: 'org-123',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    dockYardId: 'dy-002',
    name: 'Houston Logistics Hub',
    address: '2500 Port Boulevard, Houston, TX 77001',
    orgId: 'org-123',
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-02-10T09:00:00Z',
  },
  {
    dockYardId: 'dy-003',
    name: 'Austin Warehouse',
    address: '1200 Industrial Drive, Austin, TX 78701',
    orgId: 'org-123',
    createdAt: '2025-03-20T10:00:00Z',
    updatedAt: '2025-03-20T10:00:00Z',
  },
];

// Mock Docks
export const MOCK_DOCKS = [
  {
    dockId: 'dock-001',
    name: 'Dock A1',
    dockType: 'flatbed' as const,
    dockYardId: 'dy-001',
    dockYardName: 'Dallas Distribution Center',
    orgId: 'org-123',
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2025-01-15T08:30:00Z',
  },
  {
    dockId: 'dock-002',
    name: 'Dock A2',
    dockType: 'drop-in' as const,
    dockYardId: 'dy-001',
    dockYardName: 'Dallas Distribution Center',
    orgId: 'org-123',
    createdAt: '2025-01-15T08:35:00Z',
    updatedAt: '2025-01-15T08:35:00Z',
  },
  {
    dockId: 'dock-003',
    name: 'Dock B1',
    dockType: 'flatbed' as const,
    dockYardId: 'dy-002',
    dockYardName: 'Houston Logistics Hub',
    orgId: 'org-123',
    createdAt: '2025-02-10T09:30:00Z',
    updatedAt: '2025-02-10T09:30:00Z',
  },
  {
    dockId: 'dock-004',
    name: 'Dock B2',
    dockType: 'drop-in' as const,
    dockYardId: 'dy-002',
    dockYardName: 'Houston Logistics Hub',
    orgId: 'org-123',
    createdAt: '2025-02-10T09:35:00Z',
    updatedAt: '2025-02-10T09:35:00Z',
  },
  {
    dockId: 'dock-005',
    name: 'Dock C1',
    dockType: 'flatbed' as const,
    dockYardId: 'dy-003',
    dockYardName: 'Austin Warehouse',
    orgId: 'org-123',
    createdAt: '2025-03-20T10:30:00Z',
    updatedAt: '2025-03-20T10:30:00Z',
  },
];

// Mock Trailers
export const MOCK_TRAILERS = [
  {
    trailerId: 'trailer-001',
    trailerNumber: 'Trailer 101',
    currentDockId: 'dock-001',
    status: 'ACTIVE' as const,
    registrationExpiresAt: '2026-06-15T00:00:00Z',
    isRegistrationCurrent: true,
    inspectionExpiresAt: '2026-03-20T00:00:00Z',
    isInspectionCurrent: true,
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
  },
  {
    trailerId: 'trailer-002',
    trailerNumber: 'Trailer 102',
    currentDockId: 'dock-002',
    status: 'ACTIVE' as const,
    registrationExpiresAt: '2026-08-10T00:00:00Z',
    isRegistrationCurrent: true,
    inspectionExpiresAt: '2026-05-15T00:00:00Z',
    isInspectionCurrent: true,
    createdAt: '2025-01-22T11:00:00Z',
    updatedAt: '2025-01-22T11:00:00Z',
  },
  {
    trailerId: 'trailer-003',
    trailerNumber: 'Trailer 201',
    currentDockId: 'dock-003',
    status: 'ACTIVE' as const,
    registrationExpiresAt: '2026-07-25T00:00:00Z',
    isRegistrationCurrent: true,
    inspectionExpiresAt: '2025-12-30T00:00:00Z',
    isInspectionCurrent: true,
    createdAt: '2025-02-15T09:00:00Z',
    updatedAt: '2025-02-15T09:00:00Z',
  },
  {
    trailerId: 'trailer-004',
    trailerNumber: 'Trailer 202',
    currentDockId: 'dock-004',
    status: 'IN_REPAIR' as const,
    registrationExpiresAt: '2026-09-05T00:00:00Z',
    isRegistrationCurrent: true,
    inspectionExpiresAt: '2025-11-20T00:00:00Z',
    isInspectionCurrent: false,
    createdAt: '2025-02-18T10:30:00Z',
    updatedAt: '2025-10-25T14:00:00Z',
  },
  {
    trailerId: 'trailer-005',
    trailerNumber: 'Trailer 301',
    currentDockId: 'dock-005',
    status: 'ACTIVE' as const,
    registrationExpiresAt: '2026-04-12T00:00:00Z',
    isRegistrationCurrent: true,
    inspectionExpiresAt: '2026-02-28T00:00:00Z',
    isInspectionCurrent: true,
    createdAt: '2025-03-25T13:00:00Z',
    updatedAt: '2025-03-25T13:00:00Z',
  },
  {
    trailerId: 'trailer-006',
    trailerNumber: 'Trailer 302',
    currentDockId: 'dock-005',
    status: 'INACTIVE' as const,
    registrationExpiresAt: '2025-10-15T00:00:00Z',
    isRegistrationCurrent: false,
    inspectionExpiresAt: '2025-09-30T00:00:00Z',
    isInspectionCurrent: false,
    createdAt: '2025-04-10T08:00:00Z',
    updatedAt: '2025-10-15T16:00:00Z',
  },
];