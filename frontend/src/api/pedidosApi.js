import api from './axios';

export const registrarPedido = (data) => api.post('/pedidos', data);

// Admin
export const getPedidosAdmin = () => api.get('/pedidos/admin');
export const getDetallePedido = (id) => api.get(`/pedidos/admin/${id}`);
export const cambiarEstado = (id, estado) => api.patch(`/pedidos/admin/${id}/estado`, { estado });
export const editarPedido = (id, data) => api.put(`/pedidos/admin/${id}`, data);
export const validarCupon = (codigo, total) => api.post('/pedidos/validar-cupon', { codigo, total });