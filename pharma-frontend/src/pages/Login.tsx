import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="relative bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
        {/* Bloco de decoração abstrata (opcional, para um toque mais premium) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-600 dark:to-indigo-700 rounded-full mix-blend-multiply opacity-20 filter blur-xl animate-blob"></div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-purple-300 to-pink-400 dark:from-purple-600 dark:to-pink-700 rounded-full mix-blend-multiply opacity-20 filter blur-xl animation-delay-2000 animate-blob"></div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <h1 className="text-4xl font-extrabold mb-3 text-center text-gray-900 dark:text-white tracking-tight">
            Bem-vindo ao <span className="text-blue-600 dark:text-blue-400">PharmaSys</span>
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-lg">Faça login para continuar</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold mr-1">Oops!</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome de Utilizador
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              placeholder="Digite seu nome de utilizador"
              aria-label="Nome de Utilizador"
              required
            />
          </div>

          <div className="mb-7">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              placeholder="Digite sua password"
              aria-label="Password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:-translate-y-0.5"
          >
            Entrar
          </button>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 text-center">
            Credenciais de Teste:
            <br />
            <span className="font-semibold">admin</span> / <span className="font-semibold">admin123</span>
            <br />
            <span className="font-semibold">farmacia</span> / <span className="font-semibold">farma123</span>
          </p>
        </form>
      </div>
    </div>
  );
}