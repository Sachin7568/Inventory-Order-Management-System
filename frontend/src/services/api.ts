import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  created_at: string;
  customer: Customer;
  items: OrderItem[];
}

export const ProductService = {
  getAll: () => api.get<Product[]>('/products'),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id'>) => api.post<Product>('/products', data),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const CustomerService = {
  getAll: () => api.get<Customer[]>('/customers'),
  get: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: Omit<Customer, 'id'>) => api.post<Customer>('/customers', data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const OrderService = {
  getAll: () => api.get<Order[]>('/orders'),
  get: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (data: any) => api.post<Order>('/orders', data),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

export default api;
