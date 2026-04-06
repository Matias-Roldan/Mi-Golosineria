import api from './axios';

export const getClientes = () => api.get('/clientes');
export const getPerfilCliente = (id) => api.get(`/clientes/${id}/perfil`);
export const editarCliente = (id, data) => api.put(`/clientes/${id}`, data);