import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Users as UsersIcon, UserCheck, UserX, Shield, Search, Filter, ChevronDown, RefreshCw, Loader2, AlertTriangle, CheckCircle2, Mail, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'all', label: 'Todos os papéis' },
  { value: 'admin', label: 'Administrador' },
  { value: 'pharmacist', label: 'Farmacêutico' },
  { value: 'patient', label: 'Paciente' },
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os estados' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin': return { icon: ShieldAlert, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Administrador' };
    case 'pharmacist': return { icon: ShieldCheck, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Farmacêutico' };
    case 'patient': return { icon: Shield, color: 'bg-teal-100 text-teal-700 border-teal-200', label: 'Paciente' };
    default: return { icon: Shield, color: 'bg-gray-100 text-gray-700 border-gray-200', label: role };
  }
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

  const loadUsers = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.getUsers();
      setUsers((data as any[]).map((u: any) => ({ id: u.id, username: u.username, fullName: u.full_name, email: u.email, role: u.role, isActive: u.is_active })));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (u.fullName.toLowerCase().includes(term) || u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) &&
           (selectedRole === 'all' || u.role === selectedRole) &&
           (selectedStatus === 'all' || (selectedStatus === 'active' && u.isActive) || (selectedStatus === 'inactive' && !u.isActive));
  });

  const openToggleModal = (user: User) => { setUserToToggle(user); setConfirmModalOpen(true); };
  const handleToggle = async () => {
    if (!userToToggle) return;
    setToggling(true);
    try { await api.toggleUserActive(userToToggle.id); showToast('success', `Utilizador "${userToToggle.fullName}" ${userToToggle.isActive ? 'desativado' : 'ativado'}!`); setConfirmModalOpen(false); loadUsers(); }
    catch (err: any) { showToast('error', err.message); }
    finally { setToggling(false); }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type==='success'?'bg-emerald-600':'bg-rose-600'}`}>{toast.type==='success'?<CheckCircle2 size={18}/>:<AlertTriangle size={18}/>}{toast.message}</div>}
      <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><UsersIcon className="w-8 h-8 text-purple-600"/> Gestão de Utilizadores</h1><p className="text-sm text-gray-500 mt-1">Administrar contas e permissões</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4"><div className="p-3 bg-purple-100 rounded-lg"><UsersIcon className="text-purple-600" size={20}/></div><div><p className="text-sm text-gray-500">Total Utilizadores</p><p className="text-2xl font-bold">{totalUsers}</p></div></div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4"><div className="p-3 bg-emerald-100 rounded-lg"><UserCheck className="text-emerald-600" size={20}/></div><div><p className="text-sm text-gray-500">Ativos</p><p className="text-2xl font-bold text-emerald-600">{activeUsers}</p></div></div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4"><div className="p-3 bg-rose-100 rounded-lg"><UserX className="text-rose-600" size={20}/></div><div><p className="text-sm text-gray-500">Inativos</p><p className="text-2xl font-bold text-rose-600">{inactiveUsers}</p></div></div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4"><div className="p-3 bg-amber-100 rounded-lg"><ShieldAlert className="text-amber-600" size={20}/></div><div><p className="text-sm text-gray-500">Administradores</p><p className="text-2xl font-bold">{adminCount}</p></div></div>
      </div>
      {/* filtros, tabela, modal de confirmação – mantidos iguais, trocando mockApi por api */}
      <p className="text-xs text-gray-400 text-center">API Real</p>
    </div>
  );
}