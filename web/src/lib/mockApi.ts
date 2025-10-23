// Mock API implementation for demo mode
import { MOCK_LOADS, Load } from '../data/mockData';
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
    
    const loads: Load[] = JSON.parse(localStorage.getItem('demoLoads') || 'null') || MOCK_LOADS;
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

export const mockApi = {
  org: mockOrgApi,
  loads: mockLoadsApi,
};