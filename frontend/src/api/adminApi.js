import api from './axios';

export const getKpis = () => api.get('/admin/kpis');
export const getVentasDiarias = () => api.get('/admin/ventas-diarias');
export const getTopProductos = () => api.get('/admin/top-productos');
export const getHeatmap = () => api.get('/admin/heatmap');