import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  UserPlus,
  Stethoscope,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

// --------------------------------------------------------------
// Constantes
// --------------------------------------------------------------
const INITIAL_FORM = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'patient' as 'admin' | 'pharmacist' | 'patient',
};

// --------------------------------------------------------------
// Componente principal
// --------------------------------------------------------------
export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se já estiver autenticado, redireciona para o dashboard
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  // ---------- Estado ----------
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---------- Handlers ----------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!form.fullName.trim() || form.fullName.trim().length < 3) {
      setError('O nome completo deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!form.username.trim() || form.username.trim().length < 3) {
      setError('O nome de utilizador deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Por favor, insira um email válido.');
      return;
    }
    if (form.password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As passwords não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      await api.register({
        full_name: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="relative bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
        {/* Círculos decorativos (azul) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply opacity-10 filter blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mix-blend-multiply opacity-10 filter blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full mix-blend-multiply opacity-5 filter blur-2xl" />
        </div>

        <div className="relative z-10">
          {/* Logotipo azul */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Stethoscope size={32} className="text-white" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-extrabold mb-2 text-center text-gray-900 tracking-tight">
            Criar Conta
          </h1>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Preencha os dados para se registar no <span className="text-blue-600 font-semibold">Pharma</span>
          </p>

          {/* Mensagem de sucesso */}
          {success && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl mb-6 text-sm">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Conta criada com sucesso! Redireccionando para o login...</span>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl mb-6 text-sm">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome completo */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition duration-200"
                    placeholder="Ex: Maria da Silva"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Username + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Utilizador <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition duration-200"
                      placeholder="maria.silva"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition duration-200"
                      placeholder="maria@email.co.mz"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password + Confirmar Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition duration-200"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
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
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmar Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition duration-200"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Perfil / Papel (sem recepcionista) */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Perfil <span className="text-rose-500">*</span>
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                >
                  <option value="patient">Paciente</option>
                  <option value="pharmacist">Farmacêutico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Botão de registo */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Criar Conta
                  </>
                )}
              </button>
            </form>
          )}

          {/* Link para login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={14} />
              Já tem uma conta? <span className="font-semibold underline">Faça login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}