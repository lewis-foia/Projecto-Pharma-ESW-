import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Payment, Consultation } from '../types';
import {
  Search,
  Plus,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Filter,
  ChevronDown,
  Wallet,
  ReceiptText,
  DollarSign,
  Calendar,
  CreditCard,
  Hash,
} from 'lucide-react';

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
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsData, consultationsData] = await Promise.all([
        mockApi.getPayments(),
        mockApi.getConsultations(),
      ]);
      setPayments(paymentsData);
      setConsultations(consultationsData.filter(c => c.status !== 'cancelada'));
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pagamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = payments.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(term)) ||
      p.method.toLowerCase().includes(term);
    const matchesMethod = selectedMethod === 'all' || p.method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const todayPayments = payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).length;
  const todayRevenue = payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).reduce((sum, p) => sum + p.amount, 0);

  const openCreateModal = () => {
    setForm({ consultationId: 0, amount: '', method: 'Multicaixa' });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.consultationId) errors.consultationId = 'Selecione uma consulta.';
    if (!form.amount || Number(form.amount) <= 0) errors.amount = 'Valor deve ser maior que zero.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await mockApi.registerPayment(
        form.consultationId,
        Number(form.amount),
        form.method
      );
      showToast('success', 'Pagamento registado com sucesso!');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao registar pagamento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-600" />
            Pagamentos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gerir transações financeiras</p>
        </div>
        <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <Plus size={18} />
          Novo Pagamento
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl"><DollarSign className="text-emerald-600" size={20} /></div>
          <div>
            <p className="text-sm text-gray-500">Receita Total</p>
            <p className="text-2xl font-bold">{totalRevenue.toFixed(2)} MT</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl"><ReceiptText className="text-blue-600" size={20} /></div>
          <div>
            <p className="text-sm text-gray-500">Pagamentos Hoje</p>
            <p className="text-2xl font-bold">{todayPayments}</p>
            <p className="text-xs text-blue-600">{todayRevenue.toFixed(2)} MT</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl"><CreditCard className="text-purple-600" size={20} /></div>
          <div>
            <p className="text-sm text-gray-500">Transações</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por recibo ou método..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white transition"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              {METHOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 size={40} className="animate-spin mb-4 text-emerald-600" />
          <p className="text-lg font-medium">Carregando pagamentos...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-rose-500 gap-4">
          <AlertTriangle size={40} />
          <p className="text-lg font-medium">{error}</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition">
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
          <Wallet size={56} className="mb-4" />
          <p className="text-xl font-semibold text-gray-500">Nenhum pagamento encontrado</p>
          <button onClick={openCreateModal} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl border border-emerald-200 hover:bg-emerald-100 transition">
            <Plus size={16} /> Registar Primeiro Pagamento
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Recibo</th>
                  <th className="px-6 py-4">Consulta</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Método</th>
                  <th className="px-6 py-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg"><Hash size={14} className="text-gray-500" /></div>
                        <span className="font-mono text-sm font-medium text-gray-700">{p.receiptNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">#{p.consultationId}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign size={14} className="text-emerald-500" />
                        {p.amount.toFixed(2)} MT
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <CreditCard size={12} />
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(p.date).toLocaleDateString('pt-PT')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Registar Pagamento</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consulta <span className="text-rose-500">*</span></label>
                <select
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition ${formErrors.consultationId ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}
                  value={form.consultationId}
                  onChange={e => setForm({...form, consultationId: Number(e.target.value)})}
                >
                  <option value={0}>Selecione uma consulta...</option>
                  {consultations.map(c => (
                    <option key={c.id} value={c.id}>#{c.id} - {c.patientName} ({c.status})</option>
                  ))}
                </select>
                {formErrors.consultationId && <p className="text-sm text-rose-500 mt-1 flex items-center gap-1"><AlertTriangle size={14} />{formErrors.consultationId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (MT) <span className="text-rose-500">*</span></label>
                <input type="number" step="0.01" min="0"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${formErrors.amount ? 'border-rose-400 bg-rose-50' : 'border-gray-300'}`}
                  placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                />
                {formErrors.amount && <p className="text-sm text-rose-500 mt-1 flex items-center gap-1"><AlertTriangle size={14} />{formErrors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition"
                  value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
                  <option value="Multicaixa">Multicaixa</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium rounded-lg transition-colors">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Registando...</> : 'Registar Pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}