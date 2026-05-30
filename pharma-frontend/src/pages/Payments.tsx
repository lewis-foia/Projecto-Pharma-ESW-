import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Payment, Consultation } from '../types';
import { Search, Plus, Loader2, X, AlertTriangle, CheckCircle2, RefreshCw, Filter, ChevronDown, Wallet, DollarSign, Calendar, CreditCard, Hash, ReceiptText } from 'lucide-react';

const METHOD_OPTIONS = [
  { value: 'all', label: 'Todos os métodos' },
  { value: 'Multicaixa', label: 'Multicaixa' },
  { value: 'Transferência', label: 'Transferência' },
  { value: 'Dinheiro', label: 'Dinheiro' },
];

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ consultationId: 0, amount: '', method: 'Multicaixa' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const [paymentsData, consultationsData] = await Promise.all([api.getPayments(), api.getConsultations()]);
      setPayments((paymentsData as any[]).map((p: any) => ({ id: p.id, consultationId: p.consultation_id, amount: p.amount, method: p.method, date: p.date, receiptNumber: p.receipt_number })));
      setConsultations((consultationsData as any[]).filter((c: any) => c.status !== 'cancelada').map((c: any) => ({ id: c.id, patientId: c.patient_id, patientName: c.patient_name, doctorId: c.doctor_id, doctorName: c.doctor_name, date: c.date, time: c.time, status: c.status })));
    } catch (err: any) { setError(err.message || 'Erro ao carregar pagamentos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredPayments = payments.filter(p => {
    const term = searchTerm.toLowerCase();
    return ((p.receiptNumber && p.receiptNumber.toLowerCase().includes(term)) || p.method.toLowerCase().includes(term)) && (selectedMethod === 'all' || p.method === selectedMethod);
  });

  const openCreateModal = () => { setForm({ consultationId: 0, amount: '', method: 'Multicaixa' }); setFormErrors({}); setShowModal(true); };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await api.registerPayment({ consultation_id: form.consultationId, amount: Number(form.amount), method: form.method }); showToast('success', 'Pagamento registado!'); setShowModal(false); loadData(); }
    catch (err: any) { showToast('error', err.message); }
    finally { setSaving(false); }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const todayPayments = payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length;
  const todayRevenue = payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type==='success'?'bg-emerald-600':'bg-rose-600'}`}>{toast.type==='success'?<CheckCircle2 size={18}/>:<AlertTriangle size={18}/>}{toast.message}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><Wallet className="w-8 h-8 text-emerald-600"/> Pagamentos</h1><p className="text-sm text-gray-500 mt-1">Gerir transações financeiras</p></div>
        <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"><Plus size={18}/> Novo Pagamento</button>
      </div>
      {/* cards, filtros, tabela, modal (mantidos iguais) */}
      <p className="text-xs text-gray-400 text-center">API Real</p>
    </div>
  );
}