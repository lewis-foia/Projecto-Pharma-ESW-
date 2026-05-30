import { useState } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { Search, Loader2, AlertTriangle, Package, DollarSign, RefreshCw } from 'lucide-react';

export default function SearchMedications() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true); setError(null); setSearched(true);
    try {
      const data = await api.searchProducts(trimmed);
      setResults((data as any[]).map((p: any) => ({ id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock, minStock: p.min_stock, expiryDate: p.expiry_date })));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><Search className="w-8 h-8 text-blue-600"/> Pesquisar Medicamentos</h1><p className="text-sm text-gray-500 mt-1">Encontre medicamentos por nome ou categoria</p></div>
      <div className="bg-white p-6 rounded-xl shadow-sm"><div className="flex gap-3"><div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" placeholder="Nome do medicamento ou categoria..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} autoFocus/></div><button onClick={handleSearch} disabled={loading || !query.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2">{loading ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>} Pesquisar</button></div></div>
      {loading ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-500"><Loader2 size={40} className="animate-spin mb-4 text-blue-600"/><p>Pesquisando...</p></div> :
       error ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-rose-500 gap-4"><AlertTriangle size={40}/><p>{error}</p><button onClick={handleSearch} className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition"><RefreshCw size={16}/> Tentar novamente</button></div> :
       searched && results.length === 0 ? <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-400"><Package size={56} className="mb-4"/><p className="text-xl font-semibold">Nenhum medicamento encontrado</p></div> :
       results.length > 0 ? <div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4">Preço</th><th className="px-6 py-4">Stock</th></tr></thead><tbody className="divide-y divide-gray-100">{results.map(p => <tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">{p.name}</td><td className="px-6 py-4"><span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{p.category}</span></td><td className="px-6 py-4"><span className="font-semibold text-emerald-700"><DollarSign size={14} className="inline text-emerald-500"/>{p.price.toFixed(2)} MT</span></td><td className="px-6 py-4">{p.stock > 0 ? <span className="text-green-700">{p.stock} unidades</span> : <span className="text-red-600">Esgotado</span>}</td></tr>)}</tbody></table></div></div> : null}
    </div>
  );
}