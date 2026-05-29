import { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    mockApi.getDashboardSummary().then(setSummary);
  }, []);

  if (!summary) return <p className="text-gray-500">Carregando...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Produtos</h2>
          <p className="text-3xl font-bold">{summary.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Vendas Hoje</h2>
          <p className="text-3xl font-bold">{summary.todaySalesCount}</p>
          <p className="text-sm text-gray-400">{summary.todaySalesTotal.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Stock Baixo</h2>
          <p className="text-3xl font-bold text-red-600">{summary.lowStockCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Receita 7 dias</h2>
          <p className="text-3xl font-bold">
            {summary.salesLast7Days.reduce((sum: number, d: any) => sum + d.total, 0).toFixed(2)} €
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Vendas dos Últimos 7 Dias</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.salesLast7Days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
