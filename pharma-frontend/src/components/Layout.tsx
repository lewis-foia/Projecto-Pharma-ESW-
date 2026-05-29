import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Search,
  ReceiptText,
  Users,
  User,
  Stethoscope,
  CalendarCheck,
  Wallet,
  MessageCircle,
  Brain,
  ClipboardList,
  Building2,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

// --------------------------------------------------------------
// Tipos de navegação
// --------------------------------------------------------------
interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
  roles?: string[]; // se definido, só aparece para esses papéis
}

// --------------------------------------------------------------
// Itens de navegação
// --------------------------------------------------------------
const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Package, label: 'Medicamentos', roles: ['admin', 'pharmacist'] },
  { to: '/search', icon: Search, label: 'Pesquisar' },
  { to: '/sales', icon: ReceiptText, label: 'Vendas', roles: ['admin', 'pharmacist'] },
  { to: '/patients', icon: Users, label: 'Pacientes', roles: ['admin', 'recepcionista'] },
  { to: '/doctors', icon: Stethoscope, label: 'Médicos', roles: ['admin'] },
  { to: '/consultations', icon: CalendarCheck, label: 'Consultas' },
  { to: '/payments', icon: Wallet, label: 'Pagamentos', roles: ['admin', 'recepcionista'] },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/triage', icon: Brain, label: 'Triagem IA' },
  { to: '/prescriptions', icon: ClipboardList, label: 'Receitas' },
  { to: '/referrals', icon: Building2, label: 'Encaminhamentos', roles: ['admin', 'recepcionista'] },
  { to: '/notifications', icon: Bell, label: 'Notificações' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios', roles: ['admin'] },
  { to: '/admin/users', icon: User, label: 'Utilizadores', roles: ['admin'] },
];

// --------------------------------------------------------------
// Componente Layout
// --------------------------------------------------------------
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado da sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Estado da sidebar (desktop colapsada)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Filtrar itens por papel do utilizador
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white shadow-xl lg:shadow-md transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Cabeçalho da sidebar */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-extrabold text-blue-600 tracking-tight">
              <span className="text-blue-500">Pharma</span>
            </h1>
          )}
          {sidebarCollapsed && (
            <span className="mx-auto text-xl font-extrabold text-blue-600">P</span>
          )}
          {/* Botão colapsar (desktop) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {/* Botão fechar (mobile) */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== '/';
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {isActive && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Rodapé da sidebar */}
        <div className={`border-t border-gray-100 p-4 ${sidebarCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User size={16} className="text-blue-600" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center p-2 w-full' : 'px-3 py-2 w-full'
            }`}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior mobile */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white shadow-sm border-b border-gray-100 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-extrabold text-blue-600">
            <span className="text-blue-500">Pharma</span>
          </h1>
          <button
            onClick={handleLogout}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}