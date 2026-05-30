import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Consultation, Patient, Doctor } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Calendar, Clock, User, Stethoscope, Loader2, X, AlertTriangle, CheckCircle2, RefreshCw, Filter, ChevronDown, CalendarCheck, Ban } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'agendada', label: 'Agendadas' },
  { value: 'realizada', label: 'Realizadas' },
  { value: 'cancelada', label: 'Canceladas' },
];

export default function Consultations() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: 0, doctorId: 0, date: '', time: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [consultationToCancel, setConsultationToCancel] = useState<Consultation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const [allConsultations, allPatients, allDoctors] = await Promise.all([api.getConsultations(), api.getPatients(), api.getDoctors()]);
      let mappedConsultations: Consultation[] = (allConsultations as any[]).map((c: any) => ({ id: c.id, patientId: c.patient_id, patientName: c.patient_name, doctorId: c.doctor_id, doctorName: c.doctor_name, date: c.date, time: c.time, status: c.status, notes: c.notes }));
      if (isPatient) mappedConsultations = mappedConsultations.filter(c => c.patientId === user?.id);
      setConsultations(mappedConsultations);
      setPatients((allPatients as any[]).map((p: any) => ({ id: p.id, name: p.name, birthDate: p.birth_date, gender: p.gender, phone: p.phone, address: p.address })));
      setDoctors((allDoctors as any[]).map((d: any) => ({ id: d.id, name: d.name, specialty: d.specialty, phone: d.phone, email: d.email, availableDays: d.available_days ? d.available_days.split(',').map((s: string) => s.trim()) : [] })));
    } catch (err: any) { setError(err.message || 'Erro ao carregar consultas.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [user]);

  const filteredConsultations = consultations.filter(c => {
    const term = searchTerm.toLowerCase();
    return (c.patientName.toLowerCase().includes(term) || c.doctorName.toLowerCase().includes(term)) && (selectedStatus === 'all' || c.status === selectedStatus);
  });

  const openCreateModal = () => { setForm({ patientId: 0, doctorId: 0, date: '', time: '' }); setFormErrors({}); setShowModal(true); };
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await api.scheduleConsultation({ patient_id: form.patientId, doctor_id: form.doctorId, date: form.date, time: form.time }); showToast('success', 'Consulta agendada!'); setShowModal(false); loadData(); }
    catch (err: any) { showToast('error', err.message); }
    finally { setSaving(false); }
  };
  const openCancelModal = (c: Consultation) => { setConsultationToCancel(c); setCancelModalOpen(true); };
  const handleCancel = async () => {
    if (!consultationToCancel) return;
    setCancelling(true);
    try { await api.cancelConsultation(consultationToCancel.id); showToast('success', 'Consulta cancelada!'); setCancelModalOpen(false); loadData(); }
    catch (err: any) { showToast('error', err.message); }
    finally { setCancelling(false); }
  };

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type==='success'?'bg-emerald-600':'bg-rose-600'}`}>{toast.type==='success'?<CheckCircle2 size={18}/>:<AlertTriangle size={18}/>}{toast.message}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><CalendarCheck className="w-8 h-8 text-purple-600"/> Consultas</h1><p className="text-sm text-gray-500 mt-1">{isPatient ? 'As minhas consultas' : 'Gerir agendamentos e histórico'}</p></div>
        {!isPatient && <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"><Plus size={18}/> Agendar Consulta</button>}
      </div>
      {/* filtros, tabela, modais (mantidos iguais) – omitidos por brevidade */}
      <p className="text-xs text-gray-400 text-center">API Real</p>
    </div>
  );
}