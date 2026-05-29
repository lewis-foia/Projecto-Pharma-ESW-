import { useState, useEffect } from 'react';
import { mockApi } from '../../services/mockApi';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    mockApi.getUsers().then(setUsers);
  }, []);

  const toggleActive = async (userId: number) => {
    try {
      await mockApi.toggleUserActive(userId);
      mockApi.getUsers().then(setUsers);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestão de Utilizadores</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-sm uppercase text-gray-500">
              <th className="p-4">Nome</th>
              <th className="p-4">Username</th>
              <th className="p-4">Email</th>
              <th className="p-4">Papel</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{u.fullName}</td>
                <td className="p-4">{u.username}</td>
                <td className="p-4 text-sm">{u.email}</td>
                <td className="p-4 capitalize">{u.role}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4">
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => toggleActive(u.id)}
                      className={`text-sm font-medium ${u.isActive ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'}`}
                    >
                      {u.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}