import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Páginas (las iremos creando)
import LoginPage      from './pages/admin/LoginPage'
import AdminLayout    from './components/layout/AdminLayout'
import DashboardPage  from './pages/admin/DashboardPage'
import ProductosPage  from './pages/admin/ProductosPage'
import PedidosPage    from './pages/admin/PedidosPage'
import ClientesPage   from './pages/admin/ClientesPage'

// Guarda rutas que requieren estar logueado
function PrivateRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-brand-muted">Cargando...</div>
  return admin ? children : <Navigate to="/admin/login" replace />
}

// Redirige al dashboard si ya está logueado e intenta ir al login
function PublicRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return null
  return admin ? <Navigate to="/admin/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/admin/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          }/>

          {/* Panel admin (protegido) */}
          <Route path="/admin" element={
            <PrivateRoute><AdminLayout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<DashboardPage />} />
            <Route path="productos"  element={<ProductosPage />} />
            <Route path="pedidos"    element={<PedidosPage />} />
            <Route path="clientes"   element={<ClientesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}