import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', minStock: '10', expiryDate: '' });

  const load = () => mockApi.getProducts().then(setProducts);
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: '', price: '', stock: '', minStock: '10', expiryDate: '' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      minStock: String(p.minStock),
      expiryDate: p.expiryDate || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      minStock: Number(form.minStock) || 10,
      expiryDate: form.expiryDate || undefined
    };
    if (editing) {
      await mockApi.updateProduct(editing.id, data);
    } else {
      await mockApi.createProduct(data);
    }
    setShowModal(false);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Medicamentos</h1>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          + Novo Produto
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm uppercase text-gray-500">
              <th className="p-4">Nome</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Validade</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">{p.price.toFixed(2)} €</td>
                <td className={`p-4 font-bold ${p.stock <= p.minStock ? 'text-red-600' : 'text-green-600'}`}>
                  {p.stock}
                </td>
                <td className="p-4 text-sm">{p.expiryDate || '-'}</td>
                <td className="p-4">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-sm">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
            <input className="w-full p-2 border mb-3 rounded" placeholder="Nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="w-full p-2 border mb-3 rounded" placeholder="Categoria" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            <div className="flex gap-3 mb-3">
              <input type="number" className="w-1/2 p-2 border rounded" placeholder="Preço" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              <input type="number" className="w-1/2 p-2 border rounded" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
            </div>
            <input type="number" className="w-full p-2 border mb-3 rounded" placeholder="Stock mínimo" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} />
            <input type="date" className="w-full p-2 border mb-4 rounded" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
