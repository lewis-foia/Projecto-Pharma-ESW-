import { useState, useEffect } from 'react';
import { Product } from '../types';
import { mockApi } from '../services/mockApi';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Layers,
  Calendar,
} from 'lucide-react';

const CATEGORIES = [
  'Todos',
  'Analgésico',
  'Anti-inflamatório',
  'Antibiótico',
  'Inibidor de bomba',
  'Anti-histamínico',
  'Broncodilatador',
  'Ansiolítico',
  'Antidiabético',
];

const INITIAL_FORM = {
  name: '',
  category: '',
  price: '',
  stock: '',
  minStock: '10',
  expiryDate: '',
};

export default function Products() {
  // ---------- Estado ----------
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal de criação / edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  // Modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Notificação toast simples
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ---------- Carregar dados ----------
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ---------- Handlers ----------
  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      minStock: String(product.minStock),
      expiryDate: product.expiryDate || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      showToast('error', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      minStock: Number(form.minStock) || 10,
      expiryDate: form.expiryDate || undefined,
    };

    setSaving(true);
    try {
      if (editingProduct) {
        await mockApi.updateProduct(editingProduct.id, payload);
        showToast('success', 'Produto atualizado com sucesso!');
      } else {
        await mockApi.createProduct(payload);
        showToast('success', 'Produto criado com sucesso!');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao guardar produto.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      // Nota: mockApi atual não tem deleteProduct, então simulamos remoção local
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast('success', 'Produto removido com sucesso!');
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      showToast('error', 'Erro ao remover produto.');
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Filtragem ----------
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.stock <= p.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // ---------- Estatísticas rápidas ----------
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Medicamentos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerir o catálogo de produtos farmacêuticos</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Package className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total de Produtos</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Layers className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Unidades em Stock</p>
            <p className="text-2xl font-bold">{totalStock}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <AlertTriangle className="text-orange-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Stock Baixo</p>
            <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
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
              placeholder="Pesquisar por nome ou categoria..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categoria */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Toggle stock baixo */}
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Mostrar apenas produtos com stock baixo</span>
        </label>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={36} className="animate-spin mb-3" />
            <p>Carregando medicamentos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500 gap-2">
            <AlertTriangle size={36} />
            <p>{error}</p>
            <button onClick={loadProducts} className="text-sm underline hover:text-red-600">
              Tentar novamente
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package size={48} className="mb-3" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm">Tente ajustar os filtros ou criar um novo produto.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Validade</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    {/* Nome + indicador de stock baixo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            product.stock <= product.minStock
                              ? 'bg-red-100 text-red-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          {product.stock <= product.minStock && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-0.5">
                              <AlertTriangle size={12} />
                              Stock baixo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>

                    {/* Preço */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700 font-medium">
                        <DollarSign size={14} className="text-green-600" />
                        {product.price.toFixed(2)}
                      </div>
                    </td>

                    {/* Stock com barra de progresso */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={`font-semibold ${
                              product.stock <= product.minStock
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {product.stock}
                          </span>
                          <span className="text-xs text-gray-400">
                            mín. {product.minStock}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              product.stock <= product.minStock
                                ? 'bg-red-500'
                                : product.stock < product.minStock * 2
                                ? 'bg-orange-400'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (product.stock / (product.minStock * 3)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Validade */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {product.expiryDate
                          ? new Date(product.expiryDate).toLocaleDateString('pt-PT')
                          : '-'}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- Modal de Criação / Edição ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo do modal */}
            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Ex: Paracetamol 500mg"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Categoria + Preço */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Selecionar...</option>
                    {CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>

              {/* Stock + Stock mínimo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="10"
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  />
                </div>
              </div>

              {/* Validade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
            </div>

            {/* Rodapé do modal */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : editingProduct ? (
                  'Atualizar'
                ) : (
                  'Criar Produto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal de Exclusão ---------- */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Remover Produto</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Tem a certeza que deseja remover permanentemente o produto:
            </p>
            <p className="font-semibold text-gray-800 mb-6">"{productToDelete.name}"?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Removendo...
                  </>
                ) : (
                  'Remover'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Toast ---------- */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all animate-slide-up ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}