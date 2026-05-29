import { useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Product } from '../types';
import {
  Search,
  Loader2,
  AlertTriangle,
  Package,
  DollarSign,
  Layers,
  RefreshCw,
} from 'lucide-react';

export default function SearchMedications() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await mockApi.searchProducts(trimmedQuery);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao pesquisar medicamentos.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          Pesquisar Medicamentos
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Encontre medicamentos por nome ou categoria
        </p>
      </div>

      {/* Barra de pesquisa */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nome do medicamento ou categoria..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Pesquisar
          </button>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
          <p className="text-lg font-medium">Pesquisando...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-rose-500 gap-4">
          <AlertTriangle size={40} />
          <p className="text-lg font-medium">{error}</p>
          <button onClick={handleSearch} className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition">
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
          <Package size={56} className="mb-4" />
          <p className="text-xl font-semibold text-gray-500">Nenhum medicamento encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            Tente outro termo de pesquisa.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign size={14} className="text-emerald-500" />
                        {product.price.toFixed(2)} MT
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                          <Layers size={14} className="text-green-500" />
                          {product.stock} unidades
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                          <AlertTriangle size={14} />
                          Esgotado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}