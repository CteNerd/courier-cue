interface Order {
  orderId: string;
  status: 'OPEN' | 'ASSIGNED' | 'ENROUTE' | 'COMPLETED' | 'CANCELLED';
  pickup: {
    address: string;
    scheduledTime?: string;
    contact?: string;
  };
  delivery: {
    address: string;
    scheduledTime?: string;
    contact?: string;
  };
  load: {
    description: string;
    weight?: number;
    instructions?: string;
  };
  recipientName: string;
  assignedTo?: string;
  assignedAt?: string;
  startedAt?: string;
  deliveredAt?: string;
  signature?: {
    strokes: Array<Array<{ x: number; y: number }>>;
    timestamp: string;
    recipientName: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface Driver {
  driverId: string;
  name: string;
  phone: string;
  email?: string;
  activeOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL + '/api/v1';
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
          message: data.message || `HTTP ${response.status}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Network error',
        message: 'Failed to connect to the server',
      };
    }
  }

  // Order API methods
  async createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(status?: string): Promise<ApiResponse<{ orders: Order[] }>> {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<{ orders: Order[] }>(`/orders${params}`);
  }

  async getOrder(orderId: string): Promise<ApiResponse<{ order: Order; auditTrail?: any[] }>> {
    return this.request<{ order: Order; auditTrail?: any[] }>(`/orders/${orderId}`);
  }

  async assignOrder(orderId: string, driverId: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId }),
    });
  }

  async startDelivery(orderId: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}/start`, {
      method: 'POST',
    });
  }

  async completeDelivery(
    orderId: string,
    completionData: {
      recipientName: string;
      signature: {
        strokes: Array<Array<{ x: number; y: number }>>;
        timestamp: string;
        recipientName: string;
      };
    }
  ): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  // Driver API methods
  async getDrivers(): Promise<ApiResponse<{ drivers: Driver[] }>> {
    return this.request<{ drivers: Driver[] }>('/drivers');
  }

  async getDriverProfile(): Promise<ApiResponse<{ driver: Driver; activeOrder?: Order }>> {
    return this.request<{ driver: Driver; activeOrder?: Order }>('/drivers/me');
  }

  async updateDriverProfile(updates: Partial<Driver>): Promise<ApiResponse<Driver>> {
    return this.request<Driver>('/drivers/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async createDriver(driverData: Partial<Driver>): Promise<ApiResponse<Driver>> {
    return this.request<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async getDriver(driverId: string): Promise<ApiResponse<{ driver: Driver; activeOrder?: Order }>> {
    return this.request<{ driver: Driver; activeOrder?: Order }>(`/drivers/${driverId}`);
  }
}

export const apiService = new ApiService();
export type { Order, Driver, ApiResponse };