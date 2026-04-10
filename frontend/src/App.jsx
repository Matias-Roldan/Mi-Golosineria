import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SidebarProvider } from './context/SidebarContext';
import PrivateRoute from './components/ui/PrivateRoute';

import Tienda from './pages/tienda/Tienda';
import Confirmacion from './pages/tienda/Confirmacion';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Productos from './pages/admin/Productos';
import Pedidos from './pages/admin/Pedidos';
import Clientes from './pages/admin/Clientes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SidebarProvider>
          <Routes>
            {/* Tienda pública */}
            <Route path="/" element={<Tienda />} />
            <Route path="/confirmacion" element={<Confirmacion />} />

            {/* Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin/productos" element={<PrivateRoute><Productos /></PrivateRoute>} />
            <Route path="/admin/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
            <Route path="/admin/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </SidebarProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;