import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Prescription, Consultation } from '../types';
import { Search, Plus, Loader2, X, AlertTriangle, CheckCircle2, RefreshCw, ClipboardList, Calendar } from 'lucide-react';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ consultationId: 0, medication: '', dosage: '', duration: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const [prescriptionsData, consultationsData] = await Promise.all([api.getPrescriptions(), api.getConsultations()]);
      setPrescriptions((prescriptionsData as any[]).map((p: any) => ({ id: p.id, consultationId: p.consultation_id, patientId: p.patient_id, doctorId: p.doctor_id, medication: p.medication, dosage: p.dosage, duration: p.duration, issuedAt: p.issued_at })));
      setConsultations((consultationsData as any[]).filter((c: any) => c.status === 'realizada').map((c: any) => ({ id: c.id, patientId: c.patient_id, patientName: c.patient_name, doctorId: c.doctor_id, doctorName: c.doctor_name, date: c.date, time: c.time, status: c.status })));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const consultation = consultations.find(c => c.id === form.consultationId);
    if (!consultation) return;
    setSaving(true);
    try { await api.issuePrescription({ consultation_id: form.consultationId, patient_id: consultation.patientId, doctor_id: consultation.doctorId, medication: form.medication, dosage: form.dosage, duration: form.duration }); showToast('success', 'Receita emitida!'); setShowModal(false); loadData(); }
    catch (err: any) { showToast('error', err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type==='success'?'bg-emerald-600':'bg-rose-600'}`}>{toast.type==='success'?<CheckCircle2 size={18}/>:<AlertTriangle size={18}/>}{toast.message}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><ClipboardList className="w-8 h-8 text-cyan-600"/> Receitas Electrónicas</h1><p className="text-sm text-gray-500 mt-1">Emissão e histórico de prescrições</p></div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"><Plus size={18}/> Nova Receita</button>
      </div>
      {loading ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-500"><Loader2 size={40} className="animate-spin mb-4 text-cyan-600"/><p>Carregando...</p></div> :
       error ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-rose-500 gap-4"><AlertTriangle size={40}/><p>{error}</p><button onClick={loadData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition"><RefreshCw size={16}/> Tentar novamente</button></div> :
       prescriptions.length === 0 ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-400"><ClipboardList size={56} className="mb-4"/><p className="text-xl font-semibold text-gray-500">Nenhuma receita emitida</p></div> :
       <div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"><th className="px-6 py-4">Consulta</th><th className="px-6 py-4">Medicamento</th><th className="px-6 py-4">Dosagem</th><th className="px-6 py-4">Duração</th><th className="px-6 py-4">Data</th></tr></thead><tbody className="divide-y divide-gray-100">{prescriptions.map(p => <tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4">#{p.consultationId}</td><td className="px-6 py-4 font-medium">{p.medication}</td><td className="px-6 py-4">{p.dosage}</td><td className="px-6 py-4">{p.duration}</td><td className="px-6 py-4 text-sm text-gray-500"><Calendar size={14} className="inline mr-1"/>{new Date(p.issuedAt).toLocaleDateString('pt-PT')}</td></tr>)}</tbody></table></div></div>}
      {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h2 className="text-xl font-semibold text-gray-800">Emitir Receita</h2><button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={20}/></button></div><form onSubmit={handleIssue} className="p-6 space-y-5"><div><label className="block text-sm font-medium text-gray-700 mb-1">Consulta <span className="text-rose-500">*</span></label><select className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white transition" value={form.consultationId} onChange={e => setForm({...form, consultationId: Number(e.target.value)})}><option value={0}>Selecione...</option>{consultations.map(c => <option key={c.id} value={c.id}>#{c.id} - {c.patientName}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Medicamento <span className="text-rose-500">*</span></label><input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition" value={form.medication} onChange={e => setForm({...form, medication: e.target.value})}/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Dosagem <span className="text-rose-500">*</span></label><input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition" value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})}/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Duração <span className="text-rose-500">*</span></label><input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}/></div><div className="flex justify-end gap-3 pt-4 border-t border-gray-100"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-300 text-white font-medium rounded-lg transition-colors">{saving ? <><Loader2 size={16} className="animate-spin"/> Emitindo...</> : 'Emitir'}</button></div></form></div></div>}
      <p className="text-xs text-gray-400 text-center">API Real</p>
    </div>
  );
}