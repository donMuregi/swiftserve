const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to get CSRF token from cookies
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

// Fetch CSRF token from server
async function fetchCsrfToken(): Promise<void> {
  await fetch(`${API_URL}/auth/csrf/`, {
    credentials: 'include',
  });
}

// Helper function to make authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let csrfToken = getCsrfToken();
  
  // If no CSRF token and this is a mutating request, fetch one first
  if (!csrfToken && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    await fetchCsrfToken();
    csrfToken = getCsrfToken();
  }
  
  const headers: HeadersInit = {
    ...options.headers as Record<string, string>,
  };
  
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface CarOwner {
  id: number;
  user: User;
  phone_number: string;
  address: string;
  referral_code: string;
  referral_points: number;
  referral_link: string;
  referred_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: number;
  owner: number;
  owner_name?: string;
  make: string;
  model: string;
  year: number;
  registration_number: string;
  color: string;
  mileage: number;
  fuel_type: string;
  transmission: string;
  created_at: string;
  updated_at: string;
}

export interface Mechanic {
  id: number;
  user: User;
  phone_number: string;
  address: string;
  passport_photo?: string;
  id_number: string;
  license_number: string;
  rating: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Garage {
  id: number;
  user: User;
  name: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  address: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  images?: any[];
  created_at: string;
  updated_at: string;
}

export interface WorkItem {
  id: number;
  description: string;
  cost: string;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  car: number;
  owner: number;
  car_details?: Car;
  owner_details?: CarOwner;
  mechanic_details?: Mechanic;
  garage_details?: Garage;
  pickup_location: string;
  preferred_date: string;
  preferred_time: string;
  service_type: string;
  special_instructions: string;
  status: string;
  assigned_mechanic: number | null;
  assigned_garage: number | null;
  garage_cost: string;
  total_cost: string;
  work_items?: WorkItem[];
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: number;
  service_record: number;
  item_name: string;
  description: string;
  cost: string;
  created_at: string;
}

export interface ServiceRecord {
  id: number;
  service_request: number;
  car: number;
  car_details?: Car;
  owner_details?: CarOwner;
  mechanic_pickup: number | null;
  mechanic_return: number | null;
  mechanic_pickup_details?: Mechanic;
  mechanic_return_details?: Mechanic;
  garage: number | null;
  garage_details?: Garage;
  garage_person_in_charge: string;
  date_taken: string;
  date_completed: string | null;
  date_returned: string | null;
  total_cost: string;
  notes: string;
  status?: string;
  items?: ServiceItem[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  recipient_type: 'mechanic' | 'garage' | 'owner';
  recipient_mechanic: number | null;
  recipient_garage: number | null;
  recipient_owner: number | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
}

export interface Product {
  id: number;
  category: ProductCategory | null;
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string | null;
  image: string | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  is_on_sale: boolean;
  discount_percentage: number;
}

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  quantity: number;
  price: string;
  total: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: string;
  shipping_cost: string;
  total: string;
  shipping_address: string;
  phone_number: string;
  notes: string;
  items: OrderItem[];
  created_at: string;
}

export const api = {
  // Initialize CSRF token - call this on app load
  initCsrf: async () => {
    await fetch(`${API_URL}/auth/csrf/`, {
      credentials: 'include',
    });
  },

  // Authentication endpoints
  login: async (email: string, password: string) => {
    // Ensure CSRF token is set before login
    await api.initCsrf();
    
    const response = await authenticatedFetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }
    return response.json();
  },

  logout: async () => {
    const response = await authenticatedFetch(`${API_URL}/auth/logout/`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/user/`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Not authenticated');
    return response.json();
  },

  // Car Owner endpoints
  registerCarOwner: async (data: any) => {
    // First ensure CSRF token is set
    await api.initCsrf();
    
    const response = await authenticatedFetch(`${API_URL}/car-owners/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = Object.entries(errorData).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
      ).join('\n') || 'Failed to register';
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getMyProfile: async (): Promise<CarOwner> => {
    const response = await fetch(`${API_URL}/car-owners/me/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  // Car endpoints
  getCars: async (): Promise<Car[]> => {
    const response = await authenticatedFetch(`${API_URL}/cars/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch cars');
    const data = await response.json();
    return data.results || data;
  },

  createCar: async (car: any): Promise<Car> => {
    const response = await authenticatedFetch(`${API_URL}/cars/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create car');
    }
    return response.json();
  },

  // Mechanic endpoints
  registerMechanic: async (data: FormData) => {
    // Ensure CSRF token is set
    await api.initCsrf();
    const csrfToken = getCsrfToken();
    
    const headers: HeadersInit = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    const response = await fetch(`${API_URL}/mechanics/register/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: data,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = Object.entries(errorData).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
      ).join('\n') || 'Failed to register mechanic';
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getMechanicProfile: async (): Promise<Mechanic> => {
    const response = await fetch(`${API_URL}/mechanics/me/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch mechanic profile');
    return response.json();
  },

  // Garage endpoints
  registerGarage: async (data: any) => {
    // Ensure CSRF token is set
    await api.initCsrf();
    
    const response = await authenticatedFetch(`${API_URL}/garages/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }); 
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = Object.entries(errorData).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
      ).join('\n') || 'Failed to register garage';
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getGarageProfile: async (): Promise<Garage> => {
    const response = await fetch(`${API_URL}/garages/me/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch garage profile');
    return response.json();
  },

  uploadGarageImages: async (garageId: number, images: FormData) => {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    const token = getCsrfToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['X-CSRFToken'] = token;
    }
    const response = await fetch(`${API_URL}/garages/${garageId}/upload_images/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: images,
    });
    if (!response.ok) throw new Error('Failed to upload images');
    return response.json();
  },

  // Service Request endpoints
  getServiceRequests: async (): Promise<ServiceRequest[]> => {
    const response = await fetch(`${API_URL}/service-requests/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch service requests');
    const data = await response.json();
    return data.results || data;
  },

  createServiceRequest: async (data: any): Promise<ServiceRequest> => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Service request error:', errorData);
      throw new Error(JSON.stringify(errorData) || 'Failed to create service request');
    }
    return response.json();
  },

  updateServiceRequestStatus: async (id: number, status: string) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${id}/update_status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  updateServiceRequest: async (id: number, data: any) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update service request');
    return response.json();
  },

  // Driver action endpoints - follows the service flow
  acceptJob: async (requestId: number) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${requestId}/accept_job/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to accept job');
    }
    return response.json();
  },

  pickupCar: async (requestId: number) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${requestId}/pickup_car/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to pickup car');
    }
    return response.json();
  },

  deliverToGarage: async (requestId: number, garageId: number) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${requestId}/deliver_to_garage/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ garage_id: garageId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to deliver to garage');
    }
    return response.json();
  },

  completeService: async (requestId: number) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${requestId}/complete_service/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to complete service');
    }
    return response.json();
  },

  addWorkItem: async (requestId: number, description: string, cost: number) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${requestId}/add_work_item/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, cost }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add work item');
    }
    return response.json();
  },

  removeWorkItem: async (requestId: number, workItemId: number) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${requestId}/remove_work_item/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_item_id: workItemId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to remove work item');
    }
    return response.json();
  },

  returnToOwner: async (requestId: number) => {
    const response = await authenticatedFetch(`${API_URL}/service-requests/${requestId}/return_to_owner/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to return car to owner');
    }
    return response.json();
  },

  // Garage endpoints
  getGarages: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/garages/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch garages');
    const data = await response.json();
    return data.results || data;
  },

  // Service Record endpoints
  getServiceRecords: async (): Promise<ServiceRecord[]> => {
    const response = await fetch(`${API_URL}/service-records/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch service records');
    const data = await response.json();
    return data.results || data;
  },

  addServiceItem: async (recordId: number, item: any) => {
    const response = await authenticatedFetch(`${API_URL}/service-records/${recordId}/add_service_item/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to add service item');
    return response.json();
  },

  // Notification endpoints
  getNotifications: async (): Promise<Notification[]> => {
    const response = await fetch(`${API_URL}/notifications/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    const data = await response.json();
    return data.results || data;
  },

  markNotificationRead: async (id: number) => {
    const response = await authenticatedFetch(`${API_URL}/notifications/${id}/mark_read/`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  // Product endpoints
  getProducts: async (params?: { category?: string; featured?: boolean }): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.featured) searchParams.append('featured', 'true');
    
    const url = `${API_URL}/products/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.results || data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products/featured/`);
    if (!response.ok) throw new Error('Failed to fetch featured products');
    return response.json();
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${slug}/`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  getProductCategories: async (): Promise<ProductCategory[]> => {
    const response = await fetch(`${API_URL}/product-categories/`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.results || data;
  },

  // Order endpoints
  createOrder: async (data: { items: { product_id: number; quantity: number }[]; shipping_address: string; phone_number: string; notes?: string }): Promise<Order> => {
    const response = await authenticatedFetch(`${API_URL}/orders/create_order/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/orders/`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    return data.results || data;
  },

  // Service Inquiry endpoints
  submitServiceInquiry: async (data: Record<string, any>): Promise<{ message: string; reference: string }> => {
    const response = await authenticatedFetch(`${API_URL}/service-inquiry/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit inquiry');
    }
    return response.json();
  },
};
