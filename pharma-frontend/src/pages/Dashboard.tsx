import { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Sale, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShoppingCart,
  Loader2,
  RefreshCw,
  ArrowRight,
  Calendar,
  User,
  Hash,
  Layers,
  Activity,
} from 'lucide-react';

// --------------------------------------------------------------
// Componente principal
// --------------------------------------------------------------
export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, salesData, productsData] = await Promise.all([
        mockApi.getDashboardSummary(),
        mockApi.getSales(),
        mockApi.getProducts(),
      ]);

      setSummary(summaryData);

      // Últimas 5 vendas
      setRecentSales(salesData.slice(0, 5));

      // Produtos com stock baixo
      setLowStockProducts(productsData.filter((p) => p.stock <= p.minStock));
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ---------- Render: Loading ----------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <Loader2 size={48} className="animate-spin mb-5 text-blue-600" />
        <p className="text-lg font-medium text-gray-600">Carregando dashboard...</p>
        <p className="text-sm text-gray-400 mt-1">A obter dados actualizados</p>
      </div>
    );
  }

  // ---------- Render: Erro ----------
  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-rose-500 gap-4">
        <AlertTriangle size={48} />
        <p className="text-lg font-medium">{error || 'Erro ao carregar dados.'}</p>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    );
  }

  // ---------- Cálculos adicionais ----------
  const totalRevenue = summary.salesLast7Days.reduce((sum: number, d: any) => sum + d.total, 0);
  const avgDailyRevenue = totalRevenue / 7;
  const maxDay = summary.salesLast7Days.reduce((max: any, d: any) =>
    d.total > max.total ? d : max, summary.salesLast7Days[0]
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do desempenho da farmácia</p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produtos */}
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Package className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Produtos</p>
            <p className="text-2xl font-bold text-gray-800">{summary.totalProducts}</p>
          </div>
        </div>

        {/* Vendas Hoje */}
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <ShoppingCart className="text-emerald-600" size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Vendas Hoje</p>
            <p className="text-2xl font-bold text-gray-800">{summary.todaySalesCount}</p>
            <p className="text-xs text-emerald-600 font-medium">{summary.todaySalesTotal.toFixed(2)} MT</p>
          </div>
        </div>

        {/* Stock Baixo */}
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className={`p-3 rounded-xl ${summary.lowStockCount > 0 ? 'bg-rose-100' : 'bg-gray-100'}`}>
            <AlertTriangle className={summary.lowStockCount > 0 ? 'text-rose-600' : 'text-gray-400'} size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Stock Crítico</p>
            <p className={`text-2xl font-bold ${summary.lowStockCount > 0 ? 'text-rose-600' : 'text-gray-800'}`}>
              {summary.lowStockCount}
            </p>
          </div>
        </div>

        {/* Receita 7 dias */}
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <DollarSign className="text-indigo-600" size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Receita 7 Dias</p>
            <p className="text-2xl font-bold text-gray-800">{totalRevenue.toFixed(0)} MT</p>
            <p className="text-xs text-indigo-600 font-medium">Média: {avgDailyRevenue.toFixed(0)} MT/dia</p>
          </div>
        </div>
      </div>

      {/* Cards secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <TrendingUp size={18} className="text-emerald-500" />
          <div>
            <p className="text-xs text-gray-400">Melhor Dia</p>
            <p className="font-semibold text-gray-700">{maxDay?.date} → {maxDay?.total.toFixed(2)} MT</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <Clock size={18} className="text-amber-500" />
          <div>
            <p className="text-xs text-gray-400">Ticket Médio Hoje</p>
            <p className="font-semibold text-gray-700">
              {summary.todaySalesCount > 0
                ? (summary.todaySalesTotal / summary.todaySalesCount).toFixed(2)
                : '0.00'} MT
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <Layers size={18} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-400">Produtos com Stock OK</p>
            <p className="font-semibold text-gray-700">{summary.totalProducts - summary.lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Gráfico + Alertas lado a lado (desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de vendas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Vendas Diárias (Últimos 7 Dias)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={summary.salesLast7Days}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#888' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#888' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                formatter={(value: number) => [`${value.toFixed(2)} MT`, 'Total']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
              <Bar
                dataKey="total"
                fill="url(#gradient)"
                radius={[8, 8, 0, 0]}
                barSize={36}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4c6fff" />
                  <stop offset="100%" stopColor="#8b9fff" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Painel de alertas */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" />
            Alertas de Stock
          </h2>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={40} className="mx-auto mb-3" />
              <p className="text-sm font-medium">Stock normalizado</p>
              <p className="text-xs mt-1">Todos os produtos com stock adequado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <Package size={14} className="text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-rose-600">
                        Stock: {product.stock} / Mín: {product.minStock}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                    -{product.minStock - product.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Últimas Vendas
          </h2>
          <a href="/sales" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Ver todas <ArrowRight size={14} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Produto</th>
                <th className="px-6 py-3 text-center">Qtd.</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3">Vendedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    <ShoppingCart size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Nenhuma venda registada</p>
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => {
                  const saleDate = new Date(sale.createdAt);
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-700">
                            {saleDate.toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                          <span className="text-xs text-gray-400">
                            {saleDate.toLocaleTimeString('pt-PT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-medium text-gray-800">{sale.productName}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <Hash size={12} />
                          {sale.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-semibold text-indigo-600">
                          {sale.totalPrice.toFixed(2)} MT
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <User size={12} />
                          {sale.soldByName}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}