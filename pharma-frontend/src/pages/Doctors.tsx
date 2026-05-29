import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Doctor } from '../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Users,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  RefreshCw,
  Hash,
  GraduationCap,
  Clock,
} from 'lucide-react';

// --------------------------------------------------------------
// Constantes
// --------------------------------------------------------------
const INITIAL_FORM = {
  name: '',
  specialty: '',
  phone: '',
  email: '',
  availableDays: '',
};

const SPECIALTY_OPTIONS = [
  { value: 'all', label: 'Todas as especialidades' },
  { value: 'Clínica Geral', label: 'Clínica Geral' },
  { value: 'Pediatria', label: 'Pediatria' },
  { value: 'Cardiologia', label: 'Cardiologia' },
  { value: 'Dermatologia', label: 'Dermatologia' },
  { value: 'Ortopedia', label: 'Ortopedia' },
  { value: 'Oftalmologia', label: 'Oftalmologia' },
  { value: 'Ginecologia', label: 'Ginecologia' },
  { value: 'Neurologia', label: 'Neurologia' },
  { value: 'Psiquiatria', label: 'Psiquiatria' },
];

// --------------------------------------------------------------
// Helpers
// --------------------------------------------------------------
const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const getSpecialtyColor = (specialty: string): string => {
  const colors: Record<string, string> = {
    'Clínica Geral': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Pediatria': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Cardiologia': 'bg-red-100 text-red-700 border-red-200',
    'Dermatologia': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Ortopedia': 'bg-orange-100 text-orange-700 border-orange-200',
    'Oftalmologia': 'bg-violet-100 text-violet-700 border-violet-200',
    'Ginecologia': 'bg-pink-100 text-pink-700 border-pink-200',
    'Neurologia': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Psiquiatria': 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[specialty] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPhone = (phone: string): boolean =>
  /^[+]?[\d\s()-]{7,20}$/.test(phone.trim());

// --------------------------------------------------------------
// Componente principal
// --------------------------------------------------------------
export default function Doctors() {
  // ---------- Estado dos dados ----------
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Filtros ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // ---------- Modal de criação / edição ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ---------- Modal de exclusão ----------
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Toast ----------
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ---------- Carregar médicos ----------
  const loadDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.getDoctors();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar médicos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // ---------- Filtragem ----------
  const filteredDoctors = doctors.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(term) ||
      d.specialty.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      d.phone.includes(term);
    const matchesSpecialty =
      selectedSpecialty === 'all' || d.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // ---------- Estatísticas ----------
  const totalDoctors = doctors.length;
  const specialtiesCount = new Set(doctors.map((d) => d.specialty)).size;
  const avgAvailability = totalDoctors > 0
    ? Math.round(doctors.reduce((sum, d) => sum + d.availableDays.length, 0) / totalDoctors)
    : 0;

  // ---------- Handlers do formulário ----------
  const openCreateModal = () => {
    setEditingDoctor(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      phone: doctor.phone,
      email: doctor.email,
      availableDays: doctor.availableDays.join(', '),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres.';
    }
    if (!form.specialty.trim()) {
      errors.specialty = 'Especialidade é obrigatória.';
    }
    if (!form.phone.trim()) {
      errors.phone = 'Telefone é obrigatório.';
    } else if (!isValidPhone(form.phone)) {
      errors.phone = 'Formato de telefone inválido.';
    }
    if (!form.email.trim()) {
      errors.email = 'Email é obrigatório.';
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Formato de email inválido.';
    }
    if (!form.availableDays.trim()) {
      errors.availableDays = 'Dias de disponibilidade são obrigatórios.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        availableDays: form.availableDays.split(',').map((s) => s.trim()),
      };
      if (editingDoctor) {
        // Nota: mockApi actual não tem updateDoctor; simulamos localmente
        setDoctors((prev) =>
          prev.map((d) => (d.id === editingDoctor.id ? { ...d, ...payload } : d))
        );
        showToast('success', 'Médico actualizado com sucesso!');
      } else {
        await mockApi.createDoctor(payload);
        showToast('success', 'Médico criado com sucesso!');
      }
      setModalOpen(false);
      loadDoctors();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao guardar médico.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Handlers de exclusão ----------
  const openDeleteModal = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    try {
      setDoctors((prev) => prev.filter((d) => d.id !== doctorToDelete.id));
      showToast('success', 'Médico removido com sucesso!');
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
    } catch (err: any) {
      showToast('error', 'Erro ao remover médico.');
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
            <Stethoscope className="w-8 h-8 text-teal-600" />
            Médicos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gerir profissionais de saúde e especialidades</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Novo Médico
        </button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-teal-100 rounded-xl">
            <Users className="text-teal-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Médicos</p>
            <p className="text-2xl font-bold text-gray-800">{totalDoctors}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <GraduationCap className="text-indigo-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Especialidades</p>
            <p className="text-2xl font-bold text-gray-800">{specialtiesCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Clock className="text-amber-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Média de Disponibilidade</p>
            <p className="text-2xl font-bold text-gray-800">{avgAvailability} dias/sem.</p>
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
              placeholder="Pesquisar por nome, especialidade, telefone ou email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white transition"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              {SPECIALTY_OPTIONS.map((opt) => (
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
          <Loader2 size={44} className="animate-spin mb-5 text-teal-600" />
          <p className="text-lg font-medium">Carregando médicos...</p>
          <p className="text-sm text-gray-400 mt-1">A obter dados actualizados</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-rose-500 gap-4">
          <div className="p-4 bg-rose-100 rounded-full">
            <AlertTriangle size={36} />
          </div>
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={loadDoctors}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-xl border border-rose-200 hover:bg-rose-100 transition"
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="p-6 bg-gray-100 rounded-full mb-5">
            <Stethoscope size={48} className="text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-500">Nenhum médico encontrado</p>
          <p className="text-sm mt-1 text-gray-400">Tente ajustar os filtros ou cadastre um novo médico.</p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-50 text-teal-700 font-medium rounded-xl border border-teal-200 hover:bg-teal-100 transition"
          >
            <Plus size={16} /> Cadastrar Primeiro Médico
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Médico</th>
                  <th className="px-6 py-4">Especialidade</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Disponibilidade</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDoctors.map((doctor) => {
                  const specialtyColor = getSpecialtyColor(doctor.specialty);

                  return (
                    <tr key={doctor.id} className="hover:bg-gray-50 transition-colors group">
                      {/* Nome + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-sm text-teal-700">
                            {getInitials(doctor.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{doctor.name}</p>
                            <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                              <Hash size={10} />{doctor.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Especialidade */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${specialtyColor}`}>
                          <GraduationCap size={12} />
                          {doctor.specialty}
                        </span>
                      </td>

                      {/* Telefone */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                          <Phone size={14} className="text-gray-400" />
                          {doctor.phone}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate max-w-[180px]">{doctor.email}</span>
                        </div>
                      </td>

                      {/* Disponibilidade */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {doctor.availableDays.map((day) => (
                            <span
                              key={day}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              <Calendar size={10} />
                              {day}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(doctor)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar médico"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(doctor)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remover médico"
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
              A mostrar <span className="font-semibold text-gray-700">{filteredDoctors.length}</span> de{' '}
              <span className="font-semibold text-gray-700">{totalDoctors}</span> médicos
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
                {editingDoctor ? 'Editar Médico' : 'Novo Médico'}
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
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                    formErrors.name ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Dr. Carlos Pereira"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {formErrors.name && (
                  <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Especialidade + Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition ${
                      formErrors.specialty ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                    }`}
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  >
                    <option value="">Selecionar...</option>
                    {SPECIALTY_OPTIONS.filter((s) => s.value !== 'all').map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.specialty && (
                    <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                      <AlertTriangle size={14} /> {formErrors.specialty}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                      formErrors.phone ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                    }`}
                    placeholder="Ex: +258 82 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                      <AlertTriangle size={14} /> {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                    formErrors.email ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: dr.carlos@clinica.co.mz"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {formErrors.email && (
                  <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> {formErrors.email}
                  </p>
                )}
              </div>

              {/* Disponibilidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias de Disponibilidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
                    formErrors.availableDays ? 'border-rose-400 bg-rose-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Seg, Qua, Sex"
                  value={form.availableDays}
                  onChange={(e) => setForm({ ...form, availableDays: e.target.value })}
                />
                {formErrors.availableDays && (
                  <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> {formErrors.availableDays}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Separe os dias com vírgulas (ex: Seg, Ter, Qua)
                </p>
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : editingDoctor ? (
                    'Actualizar Médico'
                  ) : (
                    'Criar Médico'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Modal de Exclusão ---------- */}
      {deleteModalOpen && doctorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-100 rounded-full">
                <Trash2 size={22} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Remover Médico</h3>
            </div>
            <p className="text-gray-600 mb-1">Tem a certeza que deseja remover permanentemente o médico:</p>
            <p className="font-semibold text-gray-800 text-lg mb-1">"{doctorToDelete.name}"?</p>
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