export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'pharmacist';
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  expiryDate?: string;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  soldBy: number;
  soldByName: string;
  createdAt: string;
}
