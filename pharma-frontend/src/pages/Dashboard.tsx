import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Sale, Product, Consultation, Prescription, Notification } from '../types';
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
  Stethoscope,
  ClipboardList,
  Bell,
  Brain,
  Search,
  MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

  // Estados comuns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para profissionais
  const [summary, setSummary] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  // Estados para pacientes
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isPatient) {
        // Carregar dados pessoais do paciente via API real
        const [allConsultations, allPrescriptions, userNotifications] = await Promise.all([
          api.getConsultations(),
          api.getPrescriptions(),
          api.getNotifications(),
        ]);

        const patientId = user?.id || 0;

        // Filtrar consultas do paciente
        const myConsultations = (allConsultations as any[])
          .filter((c: any) => c.patient_id === patientId)
          .map((c: any) => ({
            id: c.id,
            patientId: c.patient_id,
            patientName: c.patient_name,
            doctorId: c.doctor_id,
            doctorName: c.doctor_name,
            date: c.date,
            time: c.time,
            status: c.status,
          }));

        // Filtrar receitas do paciente
        const myPrescriptions = (allPrescriptions as any[])
          .filter((p: any) => p.patient_id === patientId)
          .map((p: any) => ({
            id: p.id,
            consultationId: p.consultation_id,
            patientId: p.patient_id,
            doctorId: p.doctor_id,
            medication: p.medication,
            dosage: p.dosage,
            duration: p.duration,
            issuedAt: p.issued_at,
          }));

        // Mapear notificações
        const mappedNotifications = (userNotifications as any[]).map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          message: n.message,
          type: n.type,
          read: n.read,
          createdAt: n.created_at,
        }));

        setConsultations(myConsultations);
        setPrescriptions(myPrescriptions);
        setNotifications(mappedNotifications);
      } else {
        // Profissionais: carregar dados de gestão via API real
        const [productsData, salesData] = await Promise.all([
          api.getProducts(),
          api.getSales(),
        ]);

        const today = new Date().toISOString().slice(0, 10);
        const todaySales = (salesData as any[]).filter((s: any) =>
          s.created_at?.startsWith(today)
        );
        const lowStock = (productsData as any[]).filter(
          (p: any) => p.stock <= p.min_stock
        );

        setSummary({
          totalProducts: (productsData as any[]).length,
          todaySalesCount: todaySales.length,
          todaySalesTotal: todaySales.reduce(
            (sum: number, s: any) => sum + s.total_price,
            0
          ),
          lowStockCount: lowStock.length,
          salesLast7Days: calculateSalesLast7Days(salesData as any[]),
        });

        setRecentSales(
          (salesData as any[]).slice(0, 5).map((s: any) => ({
            id: s.id,
            productId: s.product_id,
            productName: s.product_name,
            quantity: s.quantity,
            totalPrice: s.total_price,
            soldBy: s.sold_by,
            soldByName: s.sold_by_name,
            createdAt: s.created_at,
          }))
        );

        setLowStockProducts(
          lowStock.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            minStock: p.min_stock,
            expiryDate: p.expiry_date,
          }))
        );
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // --- Helper para calcular vendas dos últimos 7 dias ---
  const calculateSalesLast7Days = (sales: any[]) => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const total = sales
        .filter((s: any) => s.created_at?.startsWith(dateStr))
        .reduce((sum: number, s: any) => sum + s.total_price, 0);
      days.push({
        date: d.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit' }),
        total,
      });
    }
    return days;
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <Loader2 size={48} className="animate-spin mb-5 text-blue-600" />
        <p className="text-lg font-medium">Carregando o seu painel...</p>
      </div>
    );
  }

  // --- Erro ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-rose-500 gap-4">
        <AlertTriangle size={48} />
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition"
        >
          <RefreshCw size={16} /> Tentar novamente
        </button>
      </div>
    );
  }

  // ========================
  // Dashboard do Paciente
  // ========================
  if (isPatient) {
    const nextConsultation = consultations.find((c) => c.status === 'agendada');
    const unreadNotifications = notifications.filter((n) => !n.read).length;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Olá, {user?.fullName.split(' ')[0]}!
        </h1>

        {/* Cards de resumo pessoais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Próxima Consulta</p>
              <p className="text-xl font-bold">
                {nextConsultation
                  ? `${nextConsultation.date} ${nextConsultation.time}`
                  : 'Nenhuma'}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <ClipboardList className="text-green-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Receitas Ativas</p>
              <p className="text-xl font-bold">{prescriptions.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Bell className="text-orange-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Notificações</p>
              <p className="text-xl font-bold">{unreadNotifications} por ler</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Brain className="text-purple-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Última Triagem</p>
              <p className="text-xl font-bold">Ver</p>
            </div>
          </div>
        </div>

        {/* Próximas consultas */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">As Minhas Consultas</h2>
            <Link to="/consultations" className="text-sm text-blue-600 hover:underline">
              Ver todas
            </Link>
          </div>
          {consultations.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma consulta agendada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Médico</th>
                    <th className="px-6 py-3 text-left">Data</th>
                    <th className="px-6 py-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {consultations.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-4">{c.doctorName}</td>
                      <td className="px-6 py-4">
                        {c.date} às {c.time}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge ${
                            c.status === 'agendada'
                              ? 'bg-blue-100 text-blue-700'
                              : c.status === 'realizada'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Receitas recentes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Receitas Recentes</h2>
            <Link to="/prescriptions" className="text-sm text-blue-600 hover:underline">
              Ver todas
            </Link>
          </div>
          {prescriptions.length === 0 ? (
            <div className="p-6 text-center text-gray-400">Nenhuma receita emitida.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Medicamento</th>
                    <th className="px-6 py-3 text-left">Dosagem</th>
                    <th className="px-6 py-3 text-left">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prescriptions.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 font-medium">{p.medication}</td>
                      <td className="px-6 py-4">{p.dosage}</td>
                      <td className="px-6 py-4">
                        {new Date(p.issuedAt).toLocaleDateString('pt-PT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Atalhos rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/search', icon: Search, label: 'Pesquisar Medicamento' },
            { to: '/triage', icon: Brain, label: 'Triagem de Sintomas' },
            { to: '/chat', icon: MessageCircle, label: 'Falar com Farmacêutico' },
            { to: '/notifications', icon: Bell, label: 'Notificações' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 text-center"
            >
              <item.icon size={24} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ========================
  // Dashboard Profissional
  // ========================
  const totalRevenue = summary?.salesLast7Days?.reduce(
    (sum: number, d: any) => sum + d.total,
    0
  ) || 0;
  const avgDailyRevenue = totalRevenue / 7;
  const maxDay = summary?.salesLast7Days?.reduce((max: any, d: any) =>
    d.total > max.total ? d : max,
    summary?.salesLast7Days?.[0]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
        <Activity className="w-8 h-8 text-blue-600" />
        Dashboard
      </h1>

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Package className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Produtos</p>
            <p className="text-2xl font-bold">{summary?.totalProducts || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <ShoppingCart className="text-emerald-600" size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Vendas Hoje</p>
            <p className="text-2xl font-bold">{summary?.todaySalesCount || 0}</p>
            <p className="text-xs text-emerald-600">
              {summary?.todaySalesTotal?.toFixed(2) || '0.00'} MT
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              summary?.lowStockCount > 0 ? 'bg-rose-100' : 'bg-gray-100'
            }`}
          >
            <AlertTriangle
              className={summary?.lowStockCount > 0 ? 'text-rose-600' : 'text-gray-400'}
              size={22}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">Stock Crítico</p>
            <p
              className={`text-2xl font-bold ${
                summary?.lowStockCount > 0 ? 'text-rose-600' : 'text-gray-800'
              }`}
            >
              {summary?.lowStockCount || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <DollarSign className="text-indigo-600" size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Receita 7 Dias</p>
            <p className="text-2xl font-bold">{totalRevenue.toFixed(0)} MT</p>
            <p className="text-xs text-indigo-600">
              Média: {avgDailyRevenue.toFixed(0)} MT/dia
            </p>
          </div>
        </div>
      </div>

      {/* Cards secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <TrendingUp size={18} className="text-emerald-500" />
          <div>
            <p className="text-xs text-gray-400">Melhor Dia</p>
            <p className="font-semibold">
              {maxDay?.date} → {maxDay?.total?.toFixed(2) || '0.00'} MT
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <Clock size={18} className="text-amber-500" />
          <div>
            <p className="text-xs text-gray-400">Ticket Médio Hoje</p>
            <p className="font-semibold">
              {summary?.todaySalesCount > 0
                ? (summary.todaySalesTotal / summary.todaySalesCount).toFixed(2)
                : '0.00'}{' '}
              MT
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <Layers size={18} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-400">Produtos com Stock OK</p>
            <p className="font-semibold">
              {summary?.totalProducts - summary?.lowStockCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Vendas Diárias (7 Dias)</h2>
          {summary?.salesLast7Days?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.salesLast7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)} MT`, 'Total']}
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
          ) : (
            <div className="text-center py-16 text-gray-400">
              Sem dados de vendas para o período.
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" /> Alertas de Stock
          </h2>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Stock normalizado.</div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100"
                >
                  <div>
                    <p className="text-sm font-semibold">{prod.name}</p>
                    <p className="text-xs text-rose-600">
                      Stock: {prod.stock} / Mín: {prod.minStock}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
                    -{prod.minStock - prod.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold">Últimas Vendas</h2>
          <Link to="/sales" className="text-sm text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Data</th>
                <th className="px-6 py-3 text-left">Produto</th>
                <th className="px-6 py-3 text-center">Qtd.</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-left">Vendedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-3">
                    {new Date(sale.createdAt).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-6 py-3 font-medium">{sale.productName}</td>
                  <td className="px-6 py-3 text-center">{sale.quantity}</td>
                  <td className="px-6 py-3 text-right font-semibold text-indigo-600">
                    {sale.totalPrice.toFixed(2)} MT
                  </td>
                  <td className="px-6 py-3 text-gray-500">{sale.soldByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}