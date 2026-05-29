export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'recepcionista' | 'patient';
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

export interface Patient {
  id: number;
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
  history?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  availableDays: string[];
}

export interface Consultation {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  date: string;
  time: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  notes?: string;
}

export interface Payment {
  id: number;
  consultationId: number;
  amount: number;
  method: string;
  date: string;
  receiptNumber?: string;
}

export interface Prescription {
  id: number;
  consultationId: number;
  patientId: number;
  doctorId: number;
  medication: string;
  dosage: string;
  duration: string;
  issuedAt: string;
}

export interface Referral {
  id: number;
  consultationId: number;
  patientId: number;
  toUnit: string;
  reason: string;
  date: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface TriageSymptom {
  symptom: string;
  severity: number;
}

export interface TriageResult {
  possibleConditions: string[];
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}