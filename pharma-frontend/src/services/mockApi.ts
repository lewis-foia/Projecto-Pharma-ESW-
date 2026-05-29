import { Product, User, Sale, Patient, Doctor, Consultation, Payment, Prescription, Referral, ChatMessage, Notification, TriageResult, TriageSymptom } from '../types';

// ---------- MOCK DATA ----------
const users: User[] = [
  { id: 1, username: 'admin', fullName: 'Administrador', email: 'admin@pharma.pt', role: 'admin', isActive: true },
  { id: 2, username: 'farmacia', fullName: 'Farmacêutico Chefe', email: 'farma@pharma.pt', role: 'pharmacist', isActive: true },
  { id: 3, username: 'paciente', fullName: 'Paciente Teste', email: 'paciente@pharma.pt', role: 'patient', isActive: true },
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
      soldBy: 2,
      soldByName: 'Farmacêutico Chefe',
      createdAt: saleDate.toISOString()
    });
  }
  return sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
})();

// ---------- NOVOS DADOS MOCK ----------
let patients: Patient[] = [
  { id: 1, name: 'João Silva', birthDate: '1985-04-12', gender: 'Masculino', phone: '912345678', address: 'Rua A, Lisboa' },
  { id: 2, name: 'Maria Santos', birthDate: '1990-07-25', gender: 'Feminino', phone: '923456789', address: 'Rua B, Porto' },
];

let doctors: Doctor[] = [
  { id: 1, name: 'Dr. Carlos Pereira', specialty: 'Clínica Geral', phone: '910111222', email: 'carlos@pharma.pt', availableDays: ['Seg', 'Qua', 'Sex'] },
  { id: 2, name: 'Dra. Ana Ferreira', specialty: 'Pediatria', phone: '920222333', email: 'ana@pharma.pt', availableDays: ['Ter', 'Qui'] },
];

let consultations: Consultation[] = [
  { id: 1, patientId: 1, patientName: 'João Silva', doctorId: 1, doctorName: 'Dr. Carlos Pereira', date: '2026-06-10', time: '09:00', status: 'agendada' },
];

let payments: Payment[] = [];
let prescriptions: Prescription[] = [];
let referrals: Referral[] = [];
let chatMessages: ChatMessage[] = [];
let notifications: Notification[] = [];
let triageHistory: { symptoms: TriageSymptom[]; result: TriageResult }[] = [];

// ---------- CONTADORES ----------
let nextSaleId = mockSales.length + 1;
let nextProductId = products.length + 1;
let nextUserId = users.length + 1;  // 4
let nextIds = {
  patient: 3,
  doctor: 3,
  consultation: 2,
  payment: 1,
  prescription: 1,
  referral: 1,
  chat: 1,
  notification: 1,
};

// ---------- UTILS ----------
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));
const getTodayStr = () => new Date().toISOString().slice(0, 10);

// ---------- API MOCK ----------
export const mockApi = {
  // Auth
  login: async (username: string, password: string) => {
    await delay();
    const user = users.find(
      u => u.username === username && u.isActive &&
           ((username === 'admin' && password === 'admin123') ||
            (username === 'farmacia' && password === 'farma123') ||
            (username === 'paciente' && password === 'paciente123'))
    );
    if (!user) throw new Error('Credenciais inválidas');
    return { token: 'mock-jwt-token', user };
  },

  // Registo de novo utilizador
  createUser: async (data: { fullName: string; username: string; email: string; password: string; role: User['role'] }) => {
    await delay(500);
    const exists = users.find(u => u.username === data.username);
    if (exists) throw new Error('O nome de utilizador já está em uso.');
    const newUser: User = {
      id: nextUserId++,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      isActive: true,
    };
    users.push(newUser);
    return newUser;
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
    mockSales.unshift(sale);
    return sale;
  },

  // Users (admin)
  getUsers: async () => {
    await delay();
    return users.map(({ ...rest }) => ({ ...rest }));
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
    const today = getTodayStr();
    const todaySales = mockSales.filter(s => s.createdAt.startsWith(today));
    const lowStock = products.filter(p => p.stock <= p.minStock);
    return {
      totalProducts: products.length,
      todaySalesCount: todaySales.length,
      todaySalesTotal: todaySales.reduce((sum, s) => sum + s.totalPrice, 0),
      lowStockCount: lowStock.length,
      salesLast7Days: getSalesLast7Days()
    };
  },

  // ---------- PACIENTES ----------
  getPatients: async () => { await delay(); return [...patients]; },
  createPatient: async (data: Omit<Patient, 'id'>) => {
    await delay();
    const newP: Patient = { id: nextIds.patient++, ...data };
    patients.push(newP);
    return newP;
  },
  updatePatient: async (id: number, data: Omit<Patient, 'id'>) => {
    await delay();
    const idx = patients.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Paciente não encontrado');
    patients[idx] = { id, ...data };
    return patients[idx];
  },

  // ---------- MÉDICOS ----------
  getDoctors: async () => { await delay(); return [...doctors]; },
  createDoctor: async (data: Omit<Doctor, 'id'>) => {
    await delay();
    const newD: Doctor = { id: nextIds.doctor++, ...data };
    doctors.push(newD);
    return newD;
  },

  // ---------- CONSULTAS ----------
  getConsultations: async () => { await delay(); return [...consultations]; },
  scheduleConsultation: async (data: { patientId: number; doctorId: number; date: string; time: string }) => {
    await delay();
    const patient = patients.find(p => p.id === data.patientId);
    const doctor = doctors.find(d => d.id === data.doctorId);
    if (!patient || !doctor) throw new Error('Paciente ou médico inválido');
    const newC: Consultation = {
      id: nextIds.consultation++,
      patientId: data.patientId,
      patientName: patient.name,
      doctorId: data.doctorId,
      doctorName: doctor.name,
      date: data.date,
      time: data.time,
      status: 'agendada',
    };
    consultations.push(newC);
    return newC;
  },
  cancelConsultation: async (id: number) => {
    await delay();
    const idx = consultations.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Consulta não encontrada');
    consultations[idx].status = 'cancelada';
    return consultations[idx];
  },
  updateConsultation: async (id: number, updates: Partial<Consultation>) => {
    await delay();
    const idx = consultations.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Consulta não encontrada');
    consultations[idx] = { ...consultations[idx], ...updates };
    return consultations[idx];
  },

  // ---------- PAGAMENTOS ----------
  getPayments: async () => { await delay(); return [...payments]; },
  registerPayment: async (consultationId: number, amount: number, method: string) => {
    await delay();
    const payment: Payment = {
      id: nextIds.payment++,
      consultationId,
      amount,
      method,
      date: new Date().toISOString(),
      receiptNumber: 'REC' + String(nextIds.payment).padStart(6, '0'),
    };
    payments.push(payment);
    return payment;
  },

  // ---------- PESQUISA MEDICAMENTOS ----------
  searchProducts: async (query: string) => {
    await delay();
    const q = query.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  },

  // ---------- RECEITAS ----------
  getPrescriptions: async () => { await delay(); return [...prescriptions]; },
  issuePrescription: async (data: { consultationId: number; patientId: number; doctorId: number; medication: string; dosage: string; duration: string }) => {
    await delay();
    const pres: Prescription = {
      id: nextIds.prescription++,
      ...data,
      issuedAt: new Date().toISOString(),
    };
    prescriptions.push(pres);
    return pres;
  },

  // ---------- ENCAMINHAMENTOS ----------
  getReferrals: async () => { await delay(); return [...referrals]; },
  createReferral: async (consultationId: number, patientId: number, toUnit: string, reason: string) => {
    await delay();
    const ref: Referral = {
      id: nextIds.referral++,
      consultationId,
      patientId,
      toUnit,
      reason,
      date: new Date().toISOString(),
    };
    referrals.push(ref);
    return ref;
  },

  // ---------- CHAT ----------
  getMessages: async () => { await delay(); return [...chatMessages]; },
  sendMessage: async (senderId: number, senderName: string, text: string) => {
    await delay();
    const msg: ChatMessage = {
      id: nextIds.chat++,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };
    chatMessages.push(msg);
    return msg;
  },

  // ---------- NOTIFICAÇÕES ----------
  getNotifications: async (userId: number) => {
    await delay();
    return notifications.filter(n => n.userId === userId);
  },
  createNotification: async (userId: number, message: string, type: 'info' | 'warning' | 'error') => {
    await delay();
    const notif: Notification = {
      id: nextIds.notification++,
      userId,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(notif);
    return notif;
  },
  markNotificationRead: async (id: number) => {
    await delay();
    const n = notifications.find(n => n.id === id);
    if (n) n.read = true;
  },

  // ---------- TRIAGEM IA ----------
  performTriage: async (symptoms: TriageSymptom[]) => {
    await delay(1000);
    const avgSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
    let recommendation: string;
    let urgency: TriageResult['urgency'];
    if (avgSeverity > 7) {
      recommendation = 'Dirija-se imediatamente a uma unidade de saúde.';
      urgency = 'high';
    } else if (avgSeverity > 4) {
      recommendation = 'Recomendamos uma consulta médica nos próximos dias.';
      urgency = 'medium';
    } else {
      recommendation = 'Os sintomas parecem ligeiros. Pode agendar uma teleconsulta.';
      urgency = 'low';
    }
    const result: TriageResult = {
      possibleConditions: ['Constipação comum', 'Alergia sazonal', 'Enxaqueca'],
      recommendation,
      urgency,
    };
    triageHistory.push({ symptoms, result });
    return result;
  },

  // ---------- RELATÓRIOS ----------
  getReport: async (type: string, period: string) => {
    await delay();
    if (type === 'consultations') {
      return {
        period,
        totalConsultations: consultations.length,
        byStatus: {
          agendada: consultations.filter(c => c.status === 'agendada').length,
          realizada: consultations.filter(c => c.status === 'realizada').length,
          cancelada: consultations.filter(c => c.status === 'cancelada').length,
        }
      };
    }
    if (type === 'financial') {
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      return { period, totalRevenue, paymentsCount: payments.length };
    }
    return { message: 'Tipo de relatório não implementado' };
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