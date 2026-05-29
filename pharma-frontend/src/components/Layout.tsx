import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-3 rounded ${
      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 font-bold text-xl text-blue-600">PharmaSys</div>
        <nav className="flex-1 space-y-1 px-4">
          <NavLink to="/" end className={navClass}>
            <span className="mr-3">📊</span> Dashboard
          </NavLink>
          <NavLink to="/products" className={navClass}>
            <span className="mr-3">💊</span> Medicamentos
          </NavLink>
          <NavLink to="/sales" className={navClass}>
            <span className="mr-3">🧾</span> Vendas
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/users" className={navClass}>
              <span className="mr-3">👥</span> Utilizadores
            </NavLink>
          )}
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm text-gray-500">{user?.fullName}</p>
          <button onClick={handleLogout} className="text-sm text-red-500 mt-1 hover:underline">
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}