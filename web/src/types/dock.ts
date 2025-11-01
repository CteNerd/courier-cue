export interface DockYard {
  dockYardId: string;
  name: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dock {
  dockId: string;
  name: string;
  dockYardId: string;
  dockType: 'flatbed' | 'drop-in';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDockYardFormData {
  name: string;
  address?: string;
}

export interface CreateDockFormData {
  name: string;
  dockYardId: string;
  dockType: 'flatbed' | 'drop-in';
  notes?: string;
}
