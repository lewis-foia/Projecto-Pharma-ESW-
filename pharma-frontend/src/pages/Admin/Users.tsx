import { useState, useEffect } from 'react';
import { mockApi } from '../../services/mockApi';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Mail,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  Activity,
} from 'lucide-react';

// --------------------------------------------------------------
// Constantes
// --------------------------------------------------------------
const ROLE_OPTIONS = [
  { value: 'all', label: 'Todos os papéis' },
  { value: 'admin', label: 'Administrador' },
  { value: 'pharmacist', label: 'Farmacêutico' },
  { value: 'recepcionista', label: 'Recepcionista' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os estados' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

// --------------------------------------------------------------
// Helpers
// --------------------------------------------------------------
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return { icon: ShieldAlert, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Administrador' };
    case 'pharmacist':
      return { icon: ShieldCheck, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Farmacêutico' };
    case 'recepcionista':
      return { icon: Shield, color: 'bg-teal-100 text-teal-700 border-teal-200', label: 'Recepcionista' };
    default:
      return { icon: UserIcon, color: 'bg-gray-100 text-gray-700 border-gray-200', label: role };
  }
};

// --------------------------------------------------------------
// Componente principal
// --------------------------------------------------------------
export default function Users() {
  const { user: currentUser } = useAuth();

  // ---------- Estado dos dados ----------
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Filtros ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // ---------- Modal de confirmação ----------
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);

  // ---------- Toast ----------
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ---------- Carregar utilizadores ----------
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ---------- Filtragem ----------
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && u.isActive) ||
      (selectedStatus === 'inactive' && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ---------- Estatísticas ----------
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  // ---------- Handler de toggle ----------
  const openToggleModal = (user: User) => {
    setUserToToggle(user);
    setConfirmModalOpen(true);
  };

  const handleToggle = async () => {
    if (!userToToggle) return;
    setToggling(true);
    try {
      await mockApi.toggleUserActive(userToToggle.id);
      showToast(
        'success',
        `Utilizador "${userToToggle.fullName}" ${userToToggle.isActive ? 'desativado' : 'ativado'} com sucesso!`
      );
      setConfirmModalOpen(false);
      setUserToToggle(null);
      loadUsers();
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao alterar estado do utilizador.');
    } finally {
      setToggling(false);
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
            <UsersIcon className="w-8 h-8 text-purple-600" />
            Gestão de Utilizadores
          </h1>
          <p className="text-sm text-gray-500 mt-1">Administrar contas e permissões do sistema</p>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <UsersIcon className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Utilizadores</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <UserCheck className="text-emerald-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ativos</p>
            <p className="text-2xl font-bold text-emerald-600">{activeUsers}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-100 rounded-lg">
            <UserX className="text-rose-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inativos</p>
            <p className="text-2xl font-bold text-rose-600">{inactiveUsers}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <ShieldAlert className="text-amber-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Administradores</p>
            <p className="text-2xl font-bold">{adminCount}</p>
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
              placeholder="Pesquisar por nome, username ou email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro de papel */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white transition"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filtro de estado */}
          <div className="relative">
            <Activity size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white transition"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
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
          <p className="text-lg font-medium">Carregando utilizadores...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-rose-500 gap-3">
          <AlertTriangle size={40} />
          <p className="text-lg font-medium">{error}</p>
          <button onClick={loadUsers} className="inline-flex items-center gap-2 text-sm underline hover:text-rose-600">
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <UsersIcon size={56} className="mb-4" />
          <p className="text-xl font-semibold text-gray-500">Nenhum utilizador encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros de pesquisa.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Utilizador</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Papel</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  const RoleIcon = roleBadge.icon;
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                      {/* Nome + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                              u.role === 'admin'
                                ? 'bg-purple-50 border-purple-200 text-purple-700'
                                : u.role === 'pharmacist'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-teal-50 border-teal-200 text-teal-700'
                            }`}
                          >
                            {u.fullName
                              .split(' ')
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {u.fullName}
                              {isSelf && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  Tu
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                          {u.username}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {u.email}
                        </div>
                      </td>

                      {/* Papel */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color}`}
                        >
                          <RoleIcon size={12} />
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          />
                          {u.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => openToggleModal(u)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              u.isActive
                                ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {u.isActive ? (
                              <>
                                <UserX size={14} />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} />
                                Ativar
                              </>
                            )}
                          </button>
                        )}
                        {isSelf && (
                          <span className="text-xs text-gray-400 italic">Conta atual</span>
                        )}
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
              A mostrar <span className="font-semibold text-gray-700">{filteredUsers.length}</span> de{' '}
              <span className="font-semibold text-gray-700">{totalUsers}</span> utilizadores
            </span>
            <span className="text-xs text-gray-400">Dados Mock</span>
          </div>
        </div>
      )}

      {/* ---------- Modal de Confirmação ---------- */}
      {confirmModalOpen && userToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {/* Ícone */}
            <div
              className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center ${
                userToToggle.isActive ? 'bg-rose-100' : 'bg-emerald-100'
              }`}
            >
              {userToToggle.isActive ? (
                <UserX size={28} className="text-rose-600" />
              ) : (
                <UserCheck size={28} className="text-emerald-600" />
              )}
            </div>

            {/* Texto */}
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
              {userToToggle.isActive ? 'Desativar Utilizador' : 'Ativar Utilizador'}
            </h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              {userToToggle.isActive
                ? `Tem a certeza que deseja desativar o utilizador "${userToToggle.fullName}"? Ele não poderá aceder ao sistema até ser reativado.`
                : `Tem a certeza que deseja reativar o utilizador "${userToToggle.fullName}"? Ele voltará a ter acesso ao sistema.`}
            </p>

            {/* Ações */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-medium rounded-lg transition-colors ${
                  userToToggle.isActive
                    ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
                }`}
              >
                {toggling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Aguarde...
                  </>
                ) : userToToggle.isActive ? (
                  <>
                    <UserX size={16} />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Ativar
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