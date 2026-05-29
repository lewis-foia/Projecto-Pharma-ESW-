import { useState, useEffect } from 'react';
import { Patient } from '../types';
import { mockApi } from '../services/mockApi';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  X,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Users,
  UserPlus,
  Venus,
  Mars,
  ChevronDown,
  RefreshCw,
  Hash,
} from 'lucide-react';

// --------------------------------------------------------------
// Constantes
// --------------------------------------------------------------
const INITIAL_FORM = {
  name: '',
  birthDate: '',
  gender: '' as Patient['gender'],
  phone: '',
  address: '',
};

const GENDER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' },
];

// --------------------------------------------------------------
// Helpers
// --------------------------------------------------------------
const calculateAge = (dateString: string): number => {
  const today = new Date();
  const birth = new Date(dateString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const isValidPhone = (phone: string): boolean => {
  // Aceita formatos internacionais e nacionais com ou sem espaços
  return /^[+]?[\d\s()-]{7,20}$/.test(phone.trim());
};

// --------------------------------------------------------------
// Componente principal
// --------------------------------------------------------------
export default function Patients() {
  // ---------- Estado dos dados ----------
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Filtros ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('all');

  // ---------- Modal de criação / edição ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ---------- Modal de exclusão ----------
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Toast ----------
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ---------- Carregar pacientes ----------
  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.getPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // ---------- Filtragem ----------
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.address.toLowerCase().includes(term);
    const matchesGender = selectedGender === 'all' || p.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  // ---------- Estatísticas ----------
  const totalPatients = patients.length;
  const maleCount = patients.filter((p) => p.gender === 'Masculino').length;
  const femaleCount = patients.filter((p) => p.gender === 'Feminino').length;
  const otherCount = patients.filter((p) => p.gender === 'Outro').length;

  // ---------- Handlers do formulário ----------
  const openCreateModal = () => {
    setEditingPatient(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      birthDate: patient.birthDate,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres.';
    }
    if (!form.birthDate) {
      errors.birthDate = 'Data de nascimento é obrigatória.';
    } else {
      const birthYear = new Date(form.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear < 1900 || birthYear > currentYear) {
        errors.birthDate = 'Data de nascimento inválida.';
      }
    }
    if (!form.phone.trim()) {
      errors.phone = 'Telefone é obrigatório.';
    } else if (!isValidPhone(form.phone)) {
      errors.phone = 'Formato de telefone inválido (mín. 7 dígitos).';
    }
    if (!form.address.trim()) {
      errors.address = 'Morada é obrigatória.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingPatient) {
        await mockApi.updatePatient(editingPatient.id, form);
        showToast('success', 'Paciente atualizado com sucesso!');
      } else {
        await mockApi.createPatient(form);
        showToast('success', 'Paciente criado com sucesso!');
      }
      setModalOpen(false);
      loadPatients();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao guardar paciente.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Handlers de exclusão ----------
  const openDeleteModal = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;
    setDeleting(true);
    try {
      setPatients((prev) => prev.filter((p) => p.id !== patientToDelete.id));
      showToast('success', 'Paciente removido com sucesso!');
      setDeleteModalOpen(false);
      setPatientToDelete(null);
    } catch (err: any) {
      showToast('error', 'Erro ao remover paciente.');
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all animate-slide-up ${
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
            <HeartPulse className="w-8 h-8 text-blue-600" />
            Pacientes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gerir registos e histórico de pacientes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Novo Paciente
        </button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Users className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Pacientes</p>
            <p className="text-2xl font-bold text-gray-800">{totalPatients}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Mars className="text-indigo-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Masculino</p>
            <p className="text-2xl font-bold text-gray-800">{maleCount}</p>
            <p className="text-xs text-gray-400">
              {totalPatients > 0 ? ((maleCount / totalPatients) * 100).toFixed(0) : 0}% do total
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-pink-100 rounded-xl">
            <Venus className="text-pink-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Feminino</p>
            <p className="text-2xl font-bold text-gray-800">{femaleCount}</p>
            <p className="text-xs text-gray-400">
              {totalPatients > 0 ? ((femaleCount / totalPatients) * 100).toFixed(0) : 0}% do total
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-xl">
            <User className="text-gray-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Outro</p>
            <p className="text-2xl font-bold text-gray-800">{otherCount}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telefone ou morada..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              {GENDER_OPTIONS.map((opt) => (
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
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 size={44} className="animate-spin mb-5 text-blue-600" />
          <p className="text-lg font-medium">Carregando pacientes...</p>
          <p className="text-sm text-gray-400 mt-1">A obter dados actualizados</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-rose-500 gap-4">
          <div className="p-4 bg-rose-100 rounded-full">
            <AlertTriangle size={36} />
          </div>
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={loadPatients}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition"
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="p-6 bg-gray-100 rounded-full mb-5">
            <User size={48} className="text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-500">Nenhum paciente encontrado</p>
          <p className="text-sm mt-1 text-gray-400">Tente ajustar os filtros ou cadastrar um novo paciente.</p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-xl border border-blue-200 hover:bg-blue-100 transition"
          >
            <Plus size={16} /> Cadastrar Primeiro Paciente
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Idade / Nascimento</th>
                  <th className="px-6 py-4">Género</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Morada</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => {
                  const age = calculateAge(patient.birthDate);
                  const isMale = patient.gender === 'Masculino';
                  const isFemale = patient.gender === 'Feminino';

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                      {/* Nome + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                              isMale
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : isFemale
                                ? 'bg-pink-50 border-pink-200 text-pink-700'
                                : 'bg-gray-100 border-gray-200 text-gray-700'
                            }`}
                          >
                            {getInitials(patient.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{patient.name}</p>
                            <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                              <Hash size={10} />{patient.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Idade + data nascimento */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-800 font-semibold">{age} anos</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} />
                            {new Date(patient.birthDate).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </td>

                      {/* Badge de género */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            isMale
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : isFemale
                              ? 'bg-pink-50 border-pink-200 text-pink-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isMale ? 'bg-blue-500' : isFemale ? 'bg-pink-500' : 'bg-gray-500'
                            }`}
                          />
                          {patient.gender}
                        </span>
                      </td>

                      {/* Telefone */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                          <Phone size={14} className="text-gray-400" />
                          {patient.phone}
                        </span>
                      </td>

                      {/* Morada */}
                      <td className="px-6 py-4 max-w-xs">
                        <span className="text-sm text-gray-600 flex items-start gap-1.5">
                          <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{patient.address}</span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(patient)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar paciente"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(patient)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remover paciente"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rodapé da tabela */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              A mostrar <span className="font-semibold text-gray-700">{filteredPatients.length}</span> de{' '}
              <span className="font-semibold text-gray-700">{totalPatients}</span> pacientes
            </span>
            <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">Dados Mock</span>
          </div>
        </div>
      )}

      {/* ---------- Modal de Criação / Edição ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formErrors.name ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Amélia Matsinhe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {formErrors.name && (
                  <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Data + Género */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      formErrors.birthDate ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                    }`}
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  />
                  {formErrors.birthDate && (
                    <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                      <AlertTriangle size={14} /> {formErrors.birthDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as Patient['gender'] })}
                  >
                    <option value="">Selecionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formErrors.phone ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: +258 84 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {formErrors.phone && (
                  <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Morada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Morada <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${
                    formErrors.address ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Av. Eduardo Mondlane, Maputo"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                {formErrors.address && (
                  <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> {formErrors.address}
                  </p>
                )}
              </div>

              {/* Rodapé */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : editingPatient ? (
                    'Atualizar Paciente'
                  ) : (
                    'Criar Paciente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Modal de Exclusão ---------- */}
      {deleteModalOpen && patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <Trash2 size={22} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Remover Paciente</h3>
            </div>
            <p className="text-gray-600 mb-1">Tem a certeza que deseja remover permanentemente o paciente:</p>
            <p className="font-semibold text-gray-800 text-lg mb-1">"{patientToDelete.name}"?</p>
            <p className="text-xs text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Removendo...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remover
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