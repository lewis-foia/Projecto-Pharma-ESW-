import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Users from './pages/Admin/Users'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'

// --------------------------------------------------------------
// Placeholder para páginas ainda não implementadas
// --------------------------------------------------------------
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-gray-500">
    <h1 className="text-3xl font-bold mb-4">{title}</h1>
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <p className="text-lg">🚧 Página em construção</p>
      <p className="text-sm text-gray-400 mt-2">Esta funcionalidade será implementada em breve.</p>
    </div>
  </div>
)

// --------------------------------------------------------------
// Rota protegida
// --------------------------------------------------------------
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// --------------------------------------------------------------
// Rota de admin
// --------------------------------------------------------------
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// --------------------------------------------------------------
// Página 404
// --------------------------------------------------------------
const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-500">
    <h1 className="text-6xl font-extrabold text-gray-300 mb-4">404</h1>
    <p className="text-xl font-semibold text-gray-600 mb-2">Página não encontrada</p>
    <a href="/" className="text-blue-600 hover:underline">Voltar ao Dashboard</a>
  </div>
)

// --------------------------------------------------------------
// Configuração de rotas
// --------------------------------------------------------------
function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="search" element={<PlaceholderPage title="Pesquisar Medicamentos" />} />
        <Route path="sales" element={<Sales />} />
        <Route path="patients" element={<Patients />} />
        
        <Route
          path="doctors"
          element={
            <AdminRoute>
              <Doctors />
            </AdminRoute>
          }
        />
        
        <Route path="consultations" element={<PlaceholderPage title="Consultas" />} />
        <Route path="payments" element={<PlaceholderPage title="Pagamentos" />} />
        <Route path="chat" element={<PlaceholderPage title="Chat" />} />
        <Route path="triage" element={<PlaceholderPage title="Triagem IA" />} />
        <Route path="prescriptions" element={<PlaceholderPage title="Receitas Electrónicas" />} />
        <Route path="referrals" element={<PlaceholderPage title="Encaminhamentos" />} />
        <Route path="notifications" element={<PlaceholderPage title="Notificações" />} />
        
        <Route
          path="reports"
          element={
            <AdminRoute>
              <PlaceholderPage title="Relatórios" />
            </AdminRoute>
          }
        />
        
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
  )
}

// --------------------------------------------------------------
// App principal
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