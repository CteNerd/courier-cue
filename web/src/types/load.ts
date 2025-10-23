export interface LoadItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
}

export interface ServiceAddress {
  name: string;
  contact: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface CreateLoadFormData {
  serviceAddress: ServiceAddress;
  assignedDriverId: string;
  items: LoadItem[];
  notes: string;
  priority: 'low' | 'normal' | 'high';
}

export interface CreateLoadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (loadData: CreateLoadFormData) => void;
}

export const UNIT_OPTIONS = [
  { value: 'pallet', label: 'Pallet' },
  { value: 'box', label: 'Box' },
  { value: 'case', label: 'Case' },
  { value: 'piece', label: 'Piece' }
];

export const STATE_OPTIONS = [
  { value: 'TX', label: 'Texas' },
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'FL', label: 'Florida' }
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' }
];