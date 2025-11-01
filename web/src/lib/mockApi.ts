// Mock API implementation for demo mode
import { MOCK_LOADS, Load, MOCK_TRAILERS, MOCK_DOCKS, MOCK_DOCK_YARDS } from '../data/mockData';
import { EXTENDED_DEMO_USERS } from '../data/demoUsers';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Helper function to filter loads by role
const getLoadsByRole = (role: string, userId: string, loads: Load[]) => {
  if (role === 'driver') {
    return loads.filter(load => load.assignedDriverId === userId);
  }
  return loads; // admin and coadmin see all loads
};

// Mock Organization API
export const mockOrgApi = {
  getSettings: async () => {
    await delay();
    const saved = localStorage.getItem('organizationSettings');
    return { settings: saved ? JSON.parse(saved) : DEFAULT_SETTINGS };
  },
  
  updateSettings: async (data: any) => {
    await delay();
    localStorage.setItem('organizationSettings', JSON.stringify(data));
    return { success: true };
  },
  
  listUsers: async () => {
    await delay();
    return { users: EXTENDED_DEMO_USERS };
  },
  
  inviteUser: async (data: any) => {
    await delay();
    // In a real app, this would send an email and create a pending user
    console.log('Mock: User invited', data);
    return { success: true, message: 'User invitation sent' };
  },
  
  updateUser: async (userId: string, data: any) => {
    await delay();
    console.log('Mock: User updated', userId, data);
    return { success: true };
  },
};

// Mock Loads API
export const mockLoadsApi = {
  create: async (data: any) => {
    await delay();
    const newLoad = {
      id: `load-${Date.now()}`,
      loadId: `load-${Date.now()}`,
      ...data,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    const existingLoads = JSON.parse(localStorage.getItem('demoLoads') || '[]');
    existingLoads.push(newLoad);
    localStorage.setItem('demoLoads', JSON.stringify(existingLoads));
    
    return newLoad;
  },
  
  list: async (params?: {
    status?: string;
    driverId?: string;
    from?: string;
    to?: string;
    q?: string;
  }) => {
    await delay();
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    // Get loads from localStorage or fallback to mock data
    let loads: Load[] = JSON.parse(localStorage.getItem('demoLoads') || 'null') || MOCK_LOADS;
    
    // Add loadId if missing (for compatibility)
    loads = loads.map(load => ({ ...load, loadId: load.loadId || load.id }));
    
    // Filter based on user role and params
    loads = getLoadsByRole(currentUser.role, currentUser.userId, loads);
    
    if (params) {
      if (params.status && params.status !== 'all') {
        loads = loads.filter((load: Load) => load.status === params.status);
      }
      if (params.driverId) {
        loads = loads.filter((load: Load) => load.assignedDriverId === params.driverId);
      }
      if (params.q) {
        const query = params.q.toLowerCase();
        loads = loads.filter((load: Load) => 
          load.id.toLowerCase().includes(query) ||
          load.serviceAddress.street.toLowerCase().includes(query) ||
          load.serviceAddress.city.toLowerCase().includes(query)
        );
      }
    }
    
    return { loads };
  },
  
  get: async (id: string) => {
    await delay();
    const loads: Load[] = JSON.parse(localStorage.getItem('demoLoads') || 'null') || MOCK_LOADS;
    const load = loads.find((l: Load) => l.id === id);
    if (!load) throw new Error('Load not found');
    return load;
  },
  
  update: async (id: string, data: any) => {
    await delay();
    const loads: Load[] = JSON.parse(localStorage.getItem('demoLoads') || 'null') || MOCK_LOADS;
    const index = loads.findIndex((l: Load) => l.id === id);
    if (index === -1) throw new Error('Load not found');
    
    loads[index] = { ...loads[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem('demoLoads', JSON.stringify(loads));
    
    return loads[index];
  },
  
  myLoads: async () => {
    await delay();
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    let loads: Load[] = JSON.parse(localStorage.getItem('demoLoads') || 'null') || MOCK_LOADS;
    // Add loadId if missing (for compatibility)
    loads = loads.map(load => ({ ...load, loadId: load.loadId || load.id }));
    const myLoads = loads.filter((load: Load) => load.assignedDriverId === currentUser.userId);
    
    return { loads: myLoads };
  },
  
  updateStatus: async (id: string, action: 'IN_TRANSIT' | 'DELIVERED') => {
    await delay();
    const statusMap = {
      'IN_TRANSIT': 'EN_ROUTE' as const,
      'DELIVERED': 'DELIVERED' as const
    };
    
    const loads: Load[] = JSON.parse(localStorage.getItem('demoLoads') || 'null') || MOCK_LOADS;
    const index = loads.findIndex((l: Load) => l.id === id);
    if (index === -1) throw new Error('Load not found');
    
    loads[index] = { 
      ...loads[index], 
      status: statusMap[action]
    };
    localStorage.setItem('demoLoads', JSON.stringify(loads));
    
    return { success: true };
  },
  
  getSignaturePresignUrl: async (id: string) => {
    await delay();
    // Mock S3 presigned URL
    return { 
      uploadUrl: `https://mock-s3-bucket.s3.amazonaws.com/signatures/${id}-${Date.now()}.png`,
      s3Key: `signatures/${id}-${Date.now()}.png`
    };
  },
  
  confirmSignature: async (id: string, data: any) => {
    await delay();
    console.log('Mock: Signature confirmed for load', id, data);
    
    // Update load status to delivered
    const loads: Load[] = JSON.parse(localStorage.getItem('demoLoads') || 'null') || MOCK_LOADS;
    const index = loads.findIndex((l: Load) => l.id === id);
    if (index !== -1) {
      loads[index] = { 
        ...loads[index], 
        status: 'DELIVERED',
        signatureUrl: data.signatureUrl,
        deliveredAt: new Date().toISOString()
      };
      localStorage.setItem('demoLoads', JSON.stringify(loads));
    }
    
    return { success: true };
  },
  
  getReceipt: (id: string) => {
    // Mock PDF URL
    return `data:application/pdf;base64,mock-pdf-content-for-load-${id}`;
  },
  
  sendEmail: async (id: string) => {
    await delay();
    console.log('Mock: Email sent for load', id);
    return { success: true, message: 'Email sent successfully' };
  },
};

// Mock Trailers API
const mockTrailersApi = {
  list: async () => {
    await delay();
    // Initialize with mock data if empty
    let trailers = JSON.parse(localStorage.getItem('demoTrailers') || '[]');
    if (trailers.length === 0) {
      trailers = MOCK_TRAILERS;
      localStorage.setItem('demoTrailers', JSON.stringify(trailers));
    }
    // Migrate old data: rename fields to match new interface
    trailers = trailers.map((trailer: any) => {
      const migrated: any = { ...trailer };
      if (trailer.name && !trailer.trailerNumber) {
        migrated.trailerNumber = trailer.name;
        delete migrated.name;
      }
      if (trailer.primaryDockId && !trailer.currentDockId) {
        migrated.currentDockId = trailer.primaryDockId;
        delete migrated.primaryDockId;
      }
      if (trailer.registrationExpires && !trailer.registrationExpiresAt) {
        migrated.registrationExpiresAt = trailer.registrationExpires;
        delete migrated.registrationExpires;
      }
      if (trailer.registrationCurrent !== undefined && trailer.isRegistrationCurrent === undefined) {
        migrated.isRegistrationCurrent = trailer.registrationCurrent;
        delete migrated.registrationCurrent;
      }
      if (trailer.inspectionExpires && !trailer.inspectionExpiresAt) {
        migrated.inspectionExpiresAt = trailer.inspectionExpires;
        delete migrated.inspectionExpires;
      }
      if (trailer.inspectionCurrent !== undefined && trailer.isInspectionCurrent === undefined) {
        migrated.isInspectionCurrent = trailer.inspectionCurrent;
        delete migrated.inspectionCurrent;
      }
      if (trailer.status === 'MAINTENANCE') {
        migrated.status = 'IN_REPAIR';
      }
      delete migrated.primaryDockName;
      delete migrated.orgId;
      return migrated;
    });
    localStorage.setItem('demoTrailers', JSON.stringify(trailers));
    return { trailers };
  },
  
  create: async (data: any) => {
    await delay();
    const trailers = JSON.parse(localStorage.getItem('demoTrailers') || '[]');
    const newTrailer = {
      ...data,
      trailerId: `trailer-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    trailers.push(newTrailer);
    localStorage.setItem('demoTrailers', JSON.stringify(trailers));
    return newTrailer;
  },
  
  update: async (id: string, data: any) => {
    await delay();
    const trailers = JSON.parse(localStorage.getItem('demoTrailers') || '[]');
    const index = trailers.findIndex((t: any) => t.trailerId === id);
    if (index !== -1) {
      trailers[index] = { 
        ...trailers[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem('demoTrailers', JSON.stringify(trailers));
      return trailers[index];
    }
    throw new Error('Trailer not found');
  },
};

// Mock Docks API
const mockDocksApi = {
  list: async () => {
    await delay();
    // Initialize with mock data if empty
    let docks = JSON.parse(localStorage.getItem('demoDocks') || '[]');
    if (docks.length === 0) {
      docks = MOCK_DOCKS;
      localStorage.setItem('demoDocks', JSON.stringify(docks));
    }
    // Migrate old data: rename 'type' field to 'dockType'
    docks = docks.map((dock: any) => {
      if (dock.type && !dock.dockType) {
        return { ...dock, dockType: dock.type, type: undefined };
      }
      return dock;
    });
    localStorage.setItem('demoDocks', JSON.stringify(docks));
    return { docks };
  },
  
  create: async (data: any) => {
    await delay();
    const docks = JSON.parse(localStorage.getItem('demoDocks') || '[]');
    const newDock = {
      ...data,
      dockId: `dock-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    docks.push(newDock);
    localStorage.setItem('demoDocks', JSON.stringify(docks));
    return newDock;
  },
  
  update: async (id: string, data: any) => {
    await delay();
    const docks = JSON.parse(localStorage.getItem('demoDocks') || '[]');
    const index = docks.findIndex((d: any) => d.dockId === id);
    if (index !== -1) {
      docks[index] = { 
        ...docks[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem('demoDocks', JSON.stringify(docks));
      return docks[index];
    }
    throw new Error('Dock not found');
  },
};

// Mock DockYards API
const mockDockYardsApi = {
  list: async () => {
    await delay();
    // Initialize with mock data if empty
    let dockyards = JSON.parse(localStorage.getItem('demoDockYards') || '[]');
    if (dockyards.length === 0) {
      dockyards = MOCK_DOCK_YARDS;
      localStorage.setItem('demoDockYards', JSON.stringify(dockyards));
    }
    return { dockyards };
  },
  
  create: async (data: any) => {
    await delay();
    const dockyards = JSON.parse(localStorage.getItem('demoDockYards') || '[]');
    const newDockYard = {
      ...data,
      dockYardId: `dockyard-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dockyards.push(newDockYard);
    localStorage.setItem('demoDockYards', JSON.stringify(dockyards));
    return newDockYard;
  },
  
  update: async (id: string, data: any) => {
    await delay();
    const dockyards = JSON.parse(localStorage.getItem('demoDockYards') || '[]');
    const index = dockyards.findIndex((dy: any) => dy.dockYardId === id);
    if (index !== -1) {
      dockyards[index] = { 
        ...dockyards[index], 
        ...data, 
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem('demoDockYards', JSON.stringify(dockyards));
      return dockyards[index];
    }
    throw new Error('Dock yard not found');
  },
};

export const mockApi = {
  org: mockOrgApi,
  loads: mockLoadsApi,
  trailers: mockTrailersApi,
  docks: mockDocksApi,
  dockyards: mockDockYardsApi,
};