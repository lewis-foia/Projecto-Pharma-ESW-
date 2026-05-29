import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Product, Sale } from '../types';
import {
  Plus,
  ShoppingCart,
  Calendar,
  Package,
  DollarSign,
  User,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ReceiptText,
  Search,
  Filter,
  ChevronDown,
  TrendingUp,
  Clock,
  RefreshCw,
  ArrowRight,
  Hash,
} from 'lucide-react';

// --------------------------------------------------------------
// Constantes
// --------------------------------------------------------------
const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todas as vendas' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mês' },
];

// --------------------------------------------------------------
// Helpers
// --------------------------------------------------------------
const isSameDay = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const isWithinDays = (dateStr: string, days: number): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
};

// --------------------------------------------------------------
// Componente principal
// --------------------------------------------------------------
export default function Sales() {
  // ---------- Estado dos dados ----------
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Filtros ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // ---------- Modal de venda rápida ----------
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [quickSaleError, setQuickSaleError] = useState('');
  const [quickSaleSubmitting, setQuickSaleSubmitting] = useState(false);

  // ---------- Toast ----------
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ---------- Carregar dados ----------
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesData, productsData] = await Promise.all([
        mockApi.getSales(),
        mockApi.getProducts(),
      ]);
      setSales(salesData);
      setProducts(productsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------- Filtragem ----------
  const filteredSales = sales.filter((s) => {
    // Filtro por período
    if (selectedPeriod === 'today') {
      if (!isSameDay(new Date(s.createdAt), new Date())) return false;
    } else if (selectedPeriod === 'week') {
      if (!isWithinDays(s.createdAt, 7)) return false;
    } else if (selectedPeriod === 'month') {
      if (!isWithinDays(s.createdAt, 30)) return false;
    }

    // Filtro por pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.productName.toLowerCase().includes(term) ||
        s.soldByName.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // ---------- Estatísticas ----------
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  const todaySales = sales.filter((s) => isSameDay(new Date(s.createdAt), new Date())).length;
  const todayRevenue = sales
    .filter((s) => isSameDay(new Date(s.createdAt), new Date()))
    .reduce((sum, s) => sum + s.totalPrice, 0);

  // ---------- Handler de venda rápida ----------
  const handleQuickSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickSaleError('');

    if (selectedProductId === 0) {
      setQuickSaleError('Selecione um produto.');
      return;
    }
    if (quantity < 1) {
      setQuickSaleError('A quantidade deve ser pelo menos 1.');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      setQuickSaleError('Produto não encontrado.');
      return;
    }
    if (product.stock < quantity) {
      setQuickSaleError(`Stock insuficiente. Disponível: ${product.stock} unidades.`);
      return;
    }

    try {
      setQuickSaleSubmitting(true);
      await mockApi.createSale(selectedProductId, quantity);
      showToast('success', 'Venda registada com sucesso!');
      setShowQuickSale(false);
      setSelectedProductId(0);
      setQuantity(1);
      loadData();
    } catch (err: any) {
      setQuickSaleError(err.message || 'Erro ao registar venda.');
      showToast('error', 'Erro ao registar a venda.');
    } finally {
      setQuickSaleSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const quickSaleTotal = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00';

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ReceiptText className="w-8 h-8 text-indigo-600" />
            Vendas
          </h1>
          <p className="text-sm text-gray-500 mt-1">Histórico de vendas e registo rápido</p>
        </div>
        <button
          onClick={() => setShowQuickSale(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <ShoppingCart size={18} />
          Nova Venda Rápida
        </button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <ReceiptText className="text-indigo-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total de Vendas</p>
            <p className="text-2xl font-bold">{totalSales}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <DollarSign className="text-emerald-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Receita Total</p>
            <p className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <TrendingUp className="text-amber-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ticket Médio</p>
            <p className="text-2xl font-bold">{averageTicket.toFixed(2)} €</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Vendas Hoje</p>
            <p className="text-2xl font-bold">{todaySales}</p>
            <p className="text-xs text-gray-400">{todayRevenue.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Pesquisa */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por produto ou vendedor..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Período */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white transition"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="text-lg font-medium">Carregando vendas...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-rose-500 gap-3">
          <AlertTriangle size={40} />
          <p className="text-lg font-medium">{error}</p>
          <button onClick={loadData} className="inline-flex items-center gap-2 text-sm underline hover:text-rose-600">
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <ReceiptText size={56} className="mb-4" />
          <p className="text-xl font-semibold text-gray-500">Nenhuma venda encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou registe uma nova venda.</p>
          <button
            onClick={() => setShowQuickSale(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-xl border border-indigo-200 hover:bg-indigo-100 transition"
          >
            <ShoppingCart size={16} /> Registar Venda Rápida
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Data / Hora</th>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4 text-center">Qtd.</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4">Vendedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((sale) => {
                  const saleDate = new Date(sale.createdAt);
                  const isToday = isSameDay(saleDate, new Date());

                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors group">
                      {/* Data */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isToday ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {saleDate.toLocaleDateString('pt-PT', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {saleDate.toLocaleTimeString('pt-PT', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Produto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-800">{sale.productName}</span>
                        </div>
                      </td>

                      {/* Quantidade */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
                          <Hash size={14} className="text-gray-400" />
                          {sale.quantity}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-bold text-indigo-600">
                          {sale.totalPrice.toFixed(2)} €
                        </span>
                      </td>

                      {/* Vendedor */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <User size={14} className="text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-600">{sale.soldByName}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rodapé da tabela */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-sm text-gray-500 flex items-center justify-between">
            <span>
              A mostrar <span className="font-semibold text-gray-700">{filteredSales.length}</span> de{' '}
              <span className="font-semibold text-gray-700">{sales.length}</span> vendas
            </span>
            <span className="text-xs text-gray-400">Dados Mock</span>
          </div>
        </div>
      )}

      {/* ---------- Modal de Venda Rápida ---------- */}
      {showQuickSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-indigo-600 rounded-t-2xl">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ShoppingCart size={20} />
                Nova Venda Rápida
              </h2>
              <button
                onClick={() => setShowQuickSale(false)}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo */}
            <form onSubmit={handleQuickSale} className="p-6 space-y-5">
              {/* Erro */}
              {quickSaleError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
                  <AlertTriangle size={16} />
                  {quickSaleError}
                </div>
              )}

              {/* Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                >
                  <option value={0}>Selecione um produto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                {selectedProduct && quantity > selectedProduct.stock && (
                  <p className="text-xs text-rose-500 mt-1">
                    Stock disponível: {selectedProduct.stock} unidades
                  </p>
                )}
              </div>

              {/* Total */}
              {selectedProduct && (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">{quickSaleTotal} €</span>
                </div>
              )}
            </form>

            {/* Rodapé */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowQuickSale(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleQuickSale}
                disabled={quickSaleSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors"
              >
                {quickSaleSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Registando...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Registar Venda
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}