import { Product, User, Sale } from '../types';

// ---------- MOCK DATA ----------
const users: User[] = [
  { id: 1, username: 'admin', fullName: 'Administrador', email: 'admin@pharma.pt', role: 'admin', isActive: true },
  { id: 2, username: 'farmacia', fullName: 'Farmacêutico Chefe', email: 'farma@pharma.pt', role: 'pharmacist', isActive: true }
];

const products: Product[] = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgésico', price: 2.5, stock: 150, minStock: 20, expiryDate: '2027-06-01' },
  { id: 2, name: 'Ibuprofeno 400mg', category: 'Anti-inflamatório', price: 3.8, stock: 80, minStock: 15, expiryDate: '2026-12-15' },
  { id: 3, name: 'Amoxicilina 250mg', category: 'Antibiótico', price: 5.2, stock: 60, minStock: 10, expiryDate: '2026-09-20' },
  { id: 4, name: 'Omeprazol 20mg', category: 'Inibidor de bomba', price: 4.1, stock: 120, minStock: 25, expiryDate: '2027-03-10' },
  { id: 5, name: 'Loratadina 10mg', category: 'Anti-histamínico', price: 3.0, stock: 200, minStock: 30, expiryDate: '2027-08-22' },
  { id: 6, name: 'Salbutamol 100mcg', category: 'Broncodilatador', price: 6.9, stock: 35, minStock: 5, expiryDate: '2026-11-05' },
  { id: 7, name: 'Diazepam 5mg', category: 'Ansiolítico', price: 4.5, stock: 45, minStock: 8, expiryDate: '2027-01-18' },
  { id: 8, name: 'Metformina 850mg', category: 'Antidiabético', price: 2.8, stock: 90, minStock: 12, expiryDate: '2027-05-30' },
];

let mockSales: Sale[] = (() => {
  const base = new Date();
  base.setDate(base.getDate() - 30);
  const sales: Sale[] = [];
  for (let i = 0; i < 50; i++) {
    const prod = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 5) + 1;
    const saleDate = new Date(base.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    sales.push({
      id: i + 1,
      productId: prod.id,
      productName: prod.name,
      quantity: qty,
      totalPrice: Math.round(prod.price * qty * 100) / 100,
      soldBy: 2, // farmacêutico
      soldByName: 'Farmacêutico Chefe',
      createdAt: saleDate.toISOString()
    });
  }
  return sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
})();

let nextSaleId = mockSales.length + 1;
let nextProductId = products.length + 1;

// ---------- UTILS ----------
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ---------- API MOCK ----------
export const mockApi = {
  // Auth
  login: async (username: string, password: string) => {
    await delay();
    const user = users.find(
      u => u.username === username && u.isActive &&
           ((username === 'admin' && password === 'admin123') ||
            (username === 'farmacia' && password === 'farma123'))
    );
    if (!user) throw new Error('Credenciais inválidas');
    return { token: 'mock-jwt-token', user };
  },

  // Products
  getProducts: async () => {
    await delay();
    return [...products];
  },
  createProduct: async (data: Omit<Product, 'id'>) => {
    await delay();
    const newProd: Product = { id: nextProductId++, ...data };
    products.push(newProd);
    return newProd;
  },
  updateProduct: async (id: number, data: Omit<Product, 'id'>) => {
    await delay();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Produto não encontrado');
    products[idx] = { id, ...data };
    return products[idx];
  },

  // Sales
  getSales: async () => {
    await delay();
    return [...mockSales];
  },
  createSale: async (productId: number, quantity: number) => {
    await delay();
    const prod = products.find(p => p.id === productId);
    if (!prod) throw new Error('Produto não encontrado');
    if (prod.stock < quantity) throw new Error('Stock insuficiente');
    const sale: Sale = {
      id: nextSaleId++,
      productId,
      productName: prod.name,
      quantity,
      totalPrice: Math.round(prod.price * quantity * 100) / 100,
      soldBy: 2,
      soldByName: 'Farmacêutico Chefe',
      createdAt: new Date().toISOString()
    };
    prod.stock -= quantity;
    mockSales.unshift(sale); // mais recente primeiro
    return sale;
  },

  // Users (admin)
  getUsers: async () => {
    await delay();
    return users.map(({ fullName, ...rest }) => ({ ...rest, fullName })); // não expor password
  },
  toggleUserActive: async (userId: number) => {
    await delay();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Utilizador não encontrado');
    user.isActive = !user.isActive;
    return user;
  },

  // Dashboard
  getDashboardSummary: async () => {
    await delay();
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = mockSales.filter(s => s.createdAt.startsWith(today));
    const lowStock = products.filter(p => p.stock <= p.minStock);
    return {
      totalProducts: products.length,
      todaySalesCount: todaySales.length,
      todaySalesTotal: todaySales.reduce((sum, s) => sum + s.totalPrice, 0),
      lowStockCount: lowStock.length,
      salesLast7Days: getSalesLast7Days()
    };
  }
};

// Helper para gráfico
function getSalesLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const total = mockSales
      .filter(s => s.createdAt.startsWith(dateStr))
      .reduce((sum, s) => sum + s.totalPrice, 0);
    days.push({ date: d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit' }), total });
  }
  return days;
}
