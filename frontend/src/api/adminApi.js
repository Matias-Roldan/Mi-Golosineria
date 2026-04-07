import api from './axios';

export const getKpis = () => api.get('/admin/kpis');
export const getVentasDiarias = () => api.get('/admin/ventas-diarias');
export const getTopProductos = () => api.get('/admin/top-productos');
export const getHeatmap = () => api.get('/admin/heatmap');
export const getCategorias = () => api.get('/admin/categorias');
export const getAnalisisPareto = () => api.get('/admin/analisis/pareto');
export const getAnalisisRFM = () => api.get('/admin/analisis/rfm');
export const getSaludStock = () => api.get('/admin/analisis/stock');
export const getCrossSelling = () => api.get('/admin/analisis/cross-selling');
export const getEstacionalidad = () => api.get('/admin/analisis/estacionalidad');