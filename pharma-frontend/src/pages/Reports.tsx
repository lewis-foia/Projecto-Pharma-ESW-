import { useState } from 'react';
import { api } from '../services/api';
import { BarChart3, Loader2, AlertTriangle } from 'lucide-react';

export default function Reports() {
  const [type, setType] = useState('consultations');
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true); setError(null);
    try { const res = await api.getReport(type, period); setData(res); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><BarChart3 className="w-8 h-8 text-purple-600"/> Relatórios</h1><p className="text-sm text-gray-500 mt-1">Gerar relatórios do sistema</p></div>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div><label className="block text-sm mb-1">Tipo</label><select className="p-2 border rounded" value={type} onChange={e => setType(e.target.value)}><option value="consultations">Consultas</option><option value="financial">Financeiro</option></select></div>
        <div><label className="block text-sm mb-1">Período</label><select className="p-2 border rounded" value={period} onChange={e => setPeriod(e.target.value)}><option value="daily">Diário</option><option value="weekly">Semanal</option><option value="monthly">Mensal</option></select></div>
        <button onClick={generate} disabled={loading} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-6 py-2 rounded-lg transition">{loading ? <Loader2 size={16} className="animate-spin inline mr-2"/> : null} Gerar</button>
      </div>
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3"><AlertTriangle size={20}/> {error}</div>}
      {data && <div className="bg-white p-6 rounded-xl shadow"><pre className="text-sm whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre></div>}
    </div>
  );
}