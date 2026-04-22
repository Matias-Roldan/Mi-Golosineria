import api from './axios';

export const getClientes = ({ page = 1, limit = 20, search = '' } = {}) =>
  api.get('/clientes', { params: { page, limit, search } });
export const crearCliente = (data) => api.post('/clientes', data);
export const getPerfilCliente = (id) => api.get(`/clientes/${id}/perfil`);
export const editarCliente = (id, data) => api.put(`/clientes/${id}`, data);