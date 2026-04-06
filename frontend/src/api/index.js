import api from './client'

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  me: () =>
    api.get('/auth/me'),
}

// ── Productos ─────────────────────────────────────────
export const productosAPI = {
  getDisponibles:     ()           => api.get('/productos'),
  getAdmin:           ()           => api.get('/productos/admin'),
  filtrarCategoria:   (cat)        => api.get(`/productos/categoria/${cat}`),
  crear:              (data)       => api.post('/productos/admin', data),
  editar:             (id, data)   => api.put(`/productos/admin/${id}`, data),
  eliminar:           (id)         => api.delete(`/productos/admin/${id}`),
  toggleVisibilidad:  (id)         => api.patch(`/productos/admin/${id}/visibilidad`),
}

// ── Pedidos ────────────────────────────────────────────
export const pedidosAPI = {
  registrar:      (data)    => api.post('/pedidos', data),
  getAdmin:       ()        => api.get('/pedidos/admin'),
  getDetalle:     (id)      => api.get(`/pedidos/admin/${id}`),
  cambiarEstado:  (id, est) => api.patch(`/pedidos/admin/${id}/estado`, { estado: est }),
}

// ── Clientes ───────────────────────────────────────────
export const clientesAPI = {
  getAll:    ()           => api.get('/clientes'),
  getPerfil: (id)         => api.get(`/clientes/${id}/perfil`),
  editar:    (id, data)   => api.put(`/clientes/${id}`, data),
}

// ── Admin / Dashboard ──────────────────────────────────
export const adminAPI = {
  getKpis:          () => api.get('/admin/kpis'),
  getVentasDiarias: () => api.get('/admin/ventas-diarias'),
  getTopProductos:  () => api.get('/admin/top-productos'),
  getHeatmap:       () => api.get('/admin/heatmap'),
}