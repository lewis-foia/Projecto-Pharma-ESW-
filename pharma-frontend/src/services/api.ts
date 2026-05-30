const BASE_URL = 'http://localhost:8000';

function getToken(): string {
  return localStorage.getItem('access_token') || '';
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: { ...headers(), ...options?.headers },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Erro ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Credenciais inválidas');
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    return data;
  },

  register: async (userData: any) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => request('/auth/me'),

  // Products
  getProducts: async () => request('/products/'),
  createProduct: async (data: any) =>
    request('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: async (id: number, data: any) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  searchProducts: async (query: string) =>
    request(`/products/search/?q=${encodeURIComponent(query)}`),

  // Sales
  getSales: async () => request('/sales/'),
  createSale: async (productId: number, quantity: number) =>
    request('/sales/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  // Users
  getUsers: async () => request('/users/'),
  toggleUserActive: async (userId: number) =>
    request(`/users/${userId}/toggle-active`, { method: 'PUT' }),

  // Patients
  getPatients: async () => request('/patients/'),
  createPatient: async (data: any) =>
    request('/patients/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePatient: async (id: number, data: any) =>
    request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePatient: async (id: number) =>
    request(`/patients/${id}`, { method: 'DELETE' }),

  // Doctors
  getDoctors: async () => request('/doctors/'),
  createDoctor: async (data: any) =>
    request('/doctors/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Consultations
  getConsultations: async () => request('/consultations/'),
  scheduleConsultation: async (data: any) =>
    request('/consultations/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancelConsultation: async (id: number) =>
    request(`/consultations/${id}/cancel`, { method: 'PUT' }),

  // Payments
  getPayments: async () => request('/payments/'),
  registerPayment: async (data: any) =>
    request('/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Chat
  getMessages: async () => request('/chat/'),
  sendMessage: async (text: string) =>
    request('/chat/', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Prescriptions
  getPrescriptions: async () => request('/prescriptions/'),
  issuePrescription: async (data: any) =>
    request('/prescriptions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Referrals
  getReferrals: async () => request('/referrals/'),
  createReferral: async (data: any) =>
    request('/referrals/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: async () => request('/notifications/'),
  markNotificationRead: async (id: number) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),

  // Triage
  performTriage: async (symptoms: any) =>
    request('/triage/', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    }),

  // Reports
  getReport: async (type: string, period: string) =>
    request(`/reports/?type=${type}&period=${period}`),

  // Dashboard
  getDashboardSummary: async () => {
    const [products, sales] = await Promise.all([
      api.getProducts(),
      api.getSales(),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = (sales as any[]).filter((s: any) =>
      s.created_at?.startsWith(today)
    );
    const lowStock = (products as any[]).filter(
      (p: any) => p.stock <= p.min_stock
    );
    const salesLast7Days = (() => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const total = (sales as any[])
          .filter((s: any) => s.created_at?.startsWith(dateStr))
          .reduce((sum: number, s: any) => sum + s.total_price, 0);
        days.push({
          date: d.toLocaleDateString('pt-PT', {
            weekday: 'short',
            day: '2-digit',
          }),
          total,
        });
      }
      return days;
    })();
    return {
      totalProducts: (products as any[]).length,
      todaySalesCount: todaySales.length,
      todaySalesTotal: todaySales.reduce(
        (sum: number, s: any) => sum + s.total_price,
        0
      ),
      lowStockCount: lowStock.length,
      salesLast7Days,
    };
  },
};