import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Product, Sale } from '../types';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    mockApi.getSales().then(setSales);
    mockApi.getProducts().then(setProducts);
  }, []);

  const handleQuickSale = async () => {
    setError('');
    if (!selectedProduct || quantity < 1) {
      setError('Selecione produto e quantidade válida');
      return;
    }
    try {
      await mockApi.createSale(selectedProduct, quantity);
      setShowQuickSale(false);
      setQuantity(1);
      setSelectedProduct(0);
      // refresh
      mockApi.getSales().then(setSales);
      mockApi.getProducts().then(setProducts);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectedProd = products.find(p => p.id === selectedProduct);
  const total = selectedProd ? (selectedProd.price * quantity).toFixed(2) : '0.00';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <button onClick={() => setShowQuickSale(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Registo Rápido
        </button>
      </div>

      {/* Tabela de vendas */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm uppercase text-gray-500">
              <th className="p-4">Data</th>
              <th className="p-4">Produto</th>
              <th className="p-4">Qtd</th>
              <th className="p-4">Total</th>
              <th className="p-4">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-4 text-sm">{new Date(s.createdAt).toLocaleString('pt-PT')}</td>
                <td className="p-4">{s.productName}</td>
                <td className="p-4">{s.quantity}</td>
                <td className="p-4 font-medium">{s.totalPrice.toFixed(2)} €</td>
                <td className="p-4">{s.soldByName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de venda rápida */}
      {showQuickSale && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
            <h2 className="text-xl font-bold mb-4">Nova Venda Rápida</h2>
            {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
            <label className="block text-sm mb-1">Produto</label>
            <select className="w-full p-2 border rounded mb-3" value={selectedProduct} onChange={e => setSelectedProduct(Number(e.target.value))}>
              <option value={0}>Selecione...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>
              ))}
            </select>
            <label className="block text-sm mb-1">Quantidade</label>
            <input type="number" min="1" className="w-full p-2 border rounded mb-3" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
            {selectedProd && (
              <p className="text-lg font-semibold mb-4">Total: {total} €</p>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowQuickSale(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={handleQuickSale} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Registar Venda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
