import { useState } from 'react';
import { CreateLoadFormData, LoadItem, ServiceAddress } from '../types/load';

const initialFormData: CreateLoadFormData = {
  serviceAddress: {
    name: '',
    contact: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  },
  assignedDriverId: '',
  items: [
    { id: '1', description: '', qty: 1, unit: 'pallet' }
  ],
  notes: '',
  priority: 'normal'
};

export function useCreateLoadForm() {
  const [formData, setFormData] = useState<CreateLoadFormData>(initialFormData);

  const handleAddressChange = (field: keyof ServiceAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAddress: {
        ...prev.serviceAddress,
        [field]: value
      }
    }));
  };

  const handleItemChange = (index: number, field: keyof LoadItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now().toString(), description: '', qty: 1, unit: 'pallet' }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleDriverChange = (driverId: string) => {
    setFormData(prev => ({ ...prev, assignedDriverId: driverId }));
  };

  const handlePriorityChange = (priority: 'low' | 'normal' | 'high') => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleNotesChange = (notes: string) => {
    setFormData(prev => ({ ...prev, notes }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const createLoadData = (currentUser: any, drivers: any[]) => {
    const loadId = `load-${Date.now().toString().slice(-3)}`;
    
    return {
      id: loadId,
      serviceAddress: formData.serviceAddress,
      items: formData.items.filter(item => item.description.trim() !== ''),
      assignedDriverId: formData.assignedDriverId || null,
      assignedDriverName: formData.assignedDriverId 
        ? drivers.find(d => d.userId === formData.assignedDriverId)?.displayName 
        : null,
      status: formData.assignedDriverId ? 'ASSIGNED' : 'PENDING',
      priority: formData.priority,
      notes: formData.notes,
      createdBy: currentUser?.userId,
      createdAt: new Date().toISOString(),
      orgId: currentUser?.orgId
    };
  };

  return {
    formData,
    handleAddressChange,
    handleItemChange,
    addItem,
    removeItem,
    handleDriverChange,
    handlePriorityChange,
    handleNotesChange,
    resetForm,
    createLoadData
  };
}