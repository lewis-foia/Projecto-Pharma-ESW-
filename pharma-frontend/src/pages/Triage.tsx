import { useState } from 'react';
import { api } from '../services/api';
import { TriageSymptom, TriageResult } from '../types';
import { Brain, Plus, Loader2, AlertTriangle, X } from 'lucide-react';

export default function Triage() {
  const [symptoms, setSymptoms] = useState<TriageSymptom[]>([{ symptom: '', severity: 1 }]);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSymptom = () => setSymptoms([...symptoms, { symptom: '', severity: 1 }]);
  const removeSymptom = (i: number) => { if (symptoms.length > 1) setSymptoms(symptoms.filter((_, idx) => idx !== i)); };
  const updateSymptom = (i: number, field: keyof TriageSymptom, value: string | number) => { const updated = [...symptoms]; (updated[i] as any)[field] = value; setSymptoms(updated); };

  const handleTriage = async () => {
    setLoading(true); setError(null);
    try { const res = await api.performTriage(symptoms); setResult(res); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><Brain className="w-8 h-8 text-purple-600"/> Triagem de Sintomas</h1><p className="text-sm text-gray-500 mt-1">Descreva os sintomas e receba uma recomendação</p></div>
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600 mb-4">Adicione sintomas e indique a intensidade (1-10).</p>
        {symptoms.map((s, i) => <div key={i} className="flex gap-3 mb-3 items-start"><input className="flex-1 p-2 border rounded" placeholder="Sintoma" value={s.symptom} onChange={e => updateSymptom(i, 'symptom', e.target.value)}/><input type="number" min="1" max="10" className="w-20 p-2 border rounded" value={s.severity} onChange={e => updateSymptom(i, 'severity', Number(e.target.value))}/>{symptoms.length > 1 && <button onClick={() => removeSymptom(i)} className="p-2 text-gray-400 hover:text-red-500"><X size={16}/></button>}</div>)}
        <button onClick={addSymptom} className="text-purple-600 hover:underline text-sm mb-4 flex items-center gap-1"><Plus size={14}/> Adicionar sintoma</button>
        <button onClick={handleTriage} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-2 rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 size={18} className="animate-spin"/> : null} Analisar Sintomas</button>
      </div>
      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3"><AlertTriangle size={20}/> {error}</div>}
      {result && <div className={`p-6 rounded-xl shadow border ${result.urgency === 'high' ? 'bg-red-50 border-red-200' : result.urgency === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}><h2 className="text-xl font-bold mb-3">Resultado da Triagem</h2><p className="mb-2"><span className="font-semibold">Urgência:</span> {result.urgency === 'high' ? '🔴 Alta' : result.urgency === 'medium' ? '🟡 Média' : '🟢 Baixa'}</p><p className="mb-2"><span className="font-semibold">Possíveis condições:</span> {result.possibleConditions.join(', ')}</p><p><span className="font-semibold">Recomendação:</span> {result.recommendation}</p></div>}
    </div>
  );
}