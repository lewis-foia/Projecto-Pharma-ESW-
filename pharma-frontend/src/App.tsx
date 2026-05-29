import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import { Loader2 } from 'lucide-react'

// --------------------------------------------------------------
// Lazy loading das páginas
// --------------------------------------------------------------
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const Sales = lazy(() => import('./pages/Sales'))
const Users = lazy(() => import('./pages/Admin/Users'))
const Patients = lazy(() => import('./pages/Patients'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Register = lazy(() => import('./pages/Register'))
const Consultations = lazy(() => import('./pages/Consultations'))
const Payments = lazy(() => import('./pages/Payments'))
const SearchMedications = lazy(() => import('./pages/SearchMedications'))
const Chat = lazy(() => import('./pages/Chat'))
const Triage = lazy(() => import('./pages/Triage'))
const Prescriptions = lazy(() => import('./pages/Prescriptions'))
const Referrals = lazy(() => import('./pages/Referrals'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Reports = lazy(() => import('./pages/Reports'))

// --------------------------------------------------------------
// Fallback de carregamento
// --------------------------------------------------------------
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-500">
    <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
    <p className="text-sm font-medium">Carregando página...</p>
  </div>
)

// --------------------------------------------------------------
// Página 404
// --------------------------------------------------------------
const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-500">
    <h1 className="text-6xl font-extrabold text-gray-300 mb-4">404</h1>
    <p className="text-xl font-semibold text-gray-600 mb-2">Página não encontrada</p>
    <p className="text-sm text-gray-400 mb-6">O caminho que tentou aceder não existe.</p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
    >
      Voltar ao Dashboard
    </Link>
  </div>
)

// --------------------------------------------------------------
// Rota protegida (redireciona para login se não autenticado)
// --------------------------------------------------------------
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// --------------------------------------------------------------
// Rota de admin (verifica papel do utilizador)
// --------------------------------------------------------------
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// --------------------------------------------------------------
// Rota para equipa da farmácia (admin e pharmacist)
// --------------------------------------------------------------
function PharmacyStaffRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin' && user.role !== 'pharmacist') return <Navigate to="/" replace />
  return children
}

// --------------------------------------------------------------
// Rota para admin e recepcionista
// --------------------------------------------------------------
function StaffRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin' && user.role !== 'recepcionista') return <Navigate to="/" replace />
  return children
}

// --------------------------------------------------------------
// Configuração de rotas
// --------------------------------------------------------------
function AppRoutes() {
  const { user } = useAuth()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Registo */}
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Rotas protegidas dentro do layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard (todos os papéis) */}
          <Route index element={<Dashboard />} />

          {/* Medicamentos (admin, pharmacist) */}
          <Route
            path="products"
            element={
              <PharmacyStaffRoute>
                <Products />
              </PharmacyStaffRoute>
            }
          />

          {/* Pesquisar Medicamentos (todos) */}
          <Route path="search" element={<SearchMedications />} />

          {/* Vendas (admin, pharmacist) */}
          <Route
            path="sales"
            element={
              <PharmacyStaffRoute>
                <Sales />
              </PharmacyStaffRoute>
            }
          />

          {/* Pacientes (admin, recepcionista) */}
          <Route
            path="patients"
            element={
              <StaffRoute>
                <Patients />
              </StaffRoute>
            }
          />

          {/* Médicos (admin apenas) */}
          <Route
            path="doctors"
            element={
              <AdminRoute>
                <Doctors />
              </AdminRoute>
            }
          />

          {/* Consultas (todos) */}
          <Route path="consultations" element={<Consultations />} />

          {/* Pagamentos (admin, recepcionista) */}
          <Route
            path="payments"
            element={
              <StaffRoute>
                <Payments />
              </StaffRoute>
            }
          />

          {/* Chat (todos) */}
          <Route path="chat" element={<Chat />} />

          {/* Triagem IA (todos) */}
          <Route path="triage" element={<Triage />} />

          {/* Receitas (todos) */}
          <Route path="prescriptions" element={<Prescriptions />} />

          {/* Encaminhamentos (admin, recepcionista) */}
          <Route
            path="referrals"
            element={
              <StaffRoute>
                <Referrals />
              </StaffRoute>
            }
          />

          {/* Notificações (todos) */}
          <Route path="notifications" element={<Notifications />} />

          {/* Relatórios (admin apenas) */}
          <Route
            path="reports"
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            }
          />

          {/* Administração de utilizadores (admin apenas) */}
          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

// --------------------------------------------------------------
// Componente principal da aplicação
// --------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}