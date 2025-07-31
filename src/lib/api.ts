import axios from 'axios';

const BASE_URL = 'https://cateringplusapi.ex-pansion.net/api';

// API headers for mobile app
const getBaseHeaders = () => ({
  "deviceOs": "iOS",
  "applicationVersion": "1.0.0",
  "Content-Type": "application/json",
  "buildNumber": "1",
  "deviceId": "30837E67-2E6D-57C2-9D07-4D0D64A57E30",
  "lang": "en",
  "Accept": "application/json"
});

// Authenticated headers
const getAuthHeaders = (token: string) => ({
  ...getBaseHeaders(),
  "Authorization": `bearer ${token}`
});

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: getBaseHeaders()
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `bearer ${token}`;
  }
  return config;
});

// API Types
export interface LoginRequest {
  registrationOption: number;
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  tokenCode: string;
  // Add other fields as needed
}

export interface Category {
  id: string;
  name: string;
  // Add other fields as needed
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  // Add other fields as needed
}

export interface CartItem {
  productId: string;
  quantity: number;
  extrasListIDs: string[];
}

export interface ManageCartRequest {
  quantity: number;
  extrasListIDs: string[];
  productId: string;
}

export interface CheckoutRequest {
  addressId: string;
  orderNotes: string;
}

// API Functions
export const authApi = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/Account/MobileLogin', data),
};

export const categoriesApi = {
  getCategories: () => 
    api.get<Category[]>('/Items/GetMobileCategoryDDL?Lang=en'),
  
  getProductsByCategory: (categoryId: string) => 
    api.get<Product[]>(`/Items/GetCategoriesProductsByID?CategoryID=${categoryId}`)
};

export const cartApi = {
  manageCart: (data: ManageCartRequest) => 
    api.post('/Cart/ManageCart', data),
  
  getCart: () => 
    api.get('/Cart/GetUserCartList'),
  
  calculateOrder: () => 
    api.post('/Order/OrderCalculation'),
  
  checkout: (data: CheckoutRequest) => 
    api.post('/Order/CheckOut', data)
};