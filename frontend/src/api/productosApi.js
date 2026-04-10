import api from './axios';

export const getProductosDisponibles = () => api.get('/productos');
export const getProductosPorCategoria = (categoriaId) => api.get(`/productos/categoria/${categoriaId}`);

// Admin
export const getProductosAdmin = () => api.get('/productos/admin');
export const crearProducto = (data) => api.post('/productos/admin', data);
export const editarProducto = (id, data) => api.put(`/productos/admin/${id}`, data);
export const eliminarProducto = (id) => api.delete(`/productos/admin/${id}`);
export const toggleVisibilidad = (id) => api.patch(`/productos/admin/${id}/visibilidad`);
export const subirImagen = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });