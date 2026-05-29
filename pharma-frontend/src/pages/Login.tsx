import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Stethoscope,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor, insira o nome de utilizador.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor, insira a password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="relative bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply opacity-10 filter blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply opacity-10 filter blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-multiply opacity-5 filter blur-2xl" />
        </div>

        <div className="relative z-10">
          {/* Logotipo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Stethoscope size={32} className="text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-extrabold mb-1 text-center text-gray-900 tracking-tight">
            Pharma
          </h1>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Plataforma de Gestão Farmacêutica
          </p>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl mb-6 text-sm">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Utilizador */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome de Utilizador
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition duration-200"
                  placeholder="Digite o seu utilizador"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition duration-200"
                  placeholder="Digite a sua password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão de login */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Link para registo */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não tem conta?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                Registe-se aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}