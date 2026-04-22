import api from './axios';

export const registrarPedido = (data) => api.post('/pedidos', data);

// Admin
export const getPedidosAdmin = ({ page = 1, limit = 20, search = '', estado = 'todos' } = {}) =>
  api.get('/pedidos/admin', { params: { page, limit, search, estado } });
export const getDetallePedido = (id) => api.get(`/pedidos/admin/${id}`);
export const cambiarEstado = (id, estado) => api.patch(`/pedidos/admin/${id}/estado`, { estado });
export const editarPedido = (id, data) => api.put(`/pedidos/admin/${id}`, data);
export const validarCupon = (codigo, total) => api.post('/pedidos/validar-cupon', { codigo, total });