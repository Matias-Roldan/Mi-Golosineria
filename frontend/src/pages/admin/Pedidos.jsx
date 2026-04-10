import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, X, Eye, Pencil, Filter, Menu } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import { useSidebar } from '../../context/SidebarContext';
import { getPedidosAdmin, getDetallePedido, cambiarEstado, editarPedido } from '../../api/pedidosApi';
import { registrarPedido } from '../../api/pedidosApi';
import { getProductosAdmin } from '../../api/productosApi';
import { getClientes } from '../../api/clientesApi';

const ESTADOS = ['pendiente', 'confirmado', 'entregado', 'cancelado'];
const ITEMS_POR_PAGINA = 20;

const estadoBadge = {
  pendiente:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b',  border: 'rgba(245,158,11,0.3)'  },
  confirmado: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  border: 'rgba(16,185,129,0.3)'  },
  entregado:  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.3)'  },
  cancelado:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',  border: 'rgba(239,68,68,0.3)'   },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: 'easeOut' },
  }),
};

// ── Modal Nuevo Pedido ──────────────────────────────────────────────
function ModalNuevoPedido({ onCerrar, onCreado }) {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [form, setForm] = useState({ nombre_cliente: '', telefono: '', notas: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('manual');

  useEffect(() => {
    getProductosAdmin().then(({ data }) => setProductos(data.filter(p => p.stock > 0)));
    getClientes().then(({ data }) => setClientes(data));
  }, []);

  const buscarCliente = (texto) => {
    setBusqueda(texto);
    if (texto.length < 2) return setClientesFiltrados([]);
    const filtrados = clientes.filter(c =>
      c.nombre.toLowerCase().includes(texto.toLowerCase()) || c.telefono.includes(texto)
    );
    setClientesFiltrados(filtrados.slice(0, 5));
  };

  const seleccionarCliente = (c) => {
    setForm({ ...form, nombre_cliente: c.nombre, telefono: c.telefono });
    setBusqueda(c.nombre);
    setClientesFiltrados([]);
  };

  const agregarProducto = (producto) => {
    setItems(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { id: producto.id, nombre: producto.nombre, precio: Number(producto.precio), cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad <= 0) return setItems(prev => prev.filter(i => i.id !== id));
    setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i));
  };

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return setError('Agregá al menos un producto');
    setLoading(true);
    setError('');
    try {
      await registrarPedido({
        nombre_cliente: form.nombre_cliente,
        telefono: form.telefono,
        notas: form.notas,
        items: items.map(i => ({ id: i.id, cant: i.cantidad }))
      });
      onCreado();
      onCerrar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modal.overlay}>
      <div style={modal.container}>
        <div style={modal.header}>
          <h3 style={modal.titulo}>🛒 Nuevo Pedido</h3>
          <button style={modal.btnCerrar} onClick={onCerrar}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={modal.body}>
          <div style={modal.seccion}>
            <p style={modal.seccionTitulo}>👤 Cliente</p>
            <div style={modal.tabs}>
              <button type="button" style={{ ...modal.tab, ...(tab === 'manual' ? modal.tabActivo : {}) }} onClick={() => setTab('manual')}>Manual</button>
              <button type="button" style={{ ...modal.tab, ...(tab === 'buscar' ? modal.tabActivo : {}) }} onClick={() => setTab('buscar')}>Buscar existente</button>
            </div>
            {tab === 'buscar' && (
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <input style={modal.input} placeholder="Buscar por nombre o teléfono..."
                  value={busqueda} onChange={(e) => buscarCliente(e.target.value)}
                  maxLength={100} />
                {clientesFiltrados.length > 0 && (
                  <div style={modal.dropdown}>
                    {clientesFiltrados.map(c => (
                      <div key={c.id} style={modal.dropdownItem} onClick={() => seleccionarCliente(c)}>
                        <strong style={{ color: '#f1f1f3' }}>{c.nombre}</strong>
                        <span style={{ color: '#8b8b9e' }}> — {c.telefono}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={modal.grid2}>
              <div>
                <label style={modal.label}>Nombre *</label>
                <input style={modal.input} value={form.nombre_cliente}
                  onChange={(e) => setForm({ ...form, nombre_cliente: e.target.value })}
                  placeholder="Nombre del cliente" required maxLength={100} />
              </div>
              <div>
                <label style={modal.label}>Teléfono *</label>
                <input style={modal.input} value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
                  placeholder="Ej: 5491155556666" required inputMode="numeric" maxLength={20} />
              </div>
            </div>
            <div>
              <label style={modal.label}>Notas</label>
              <input style={modal.input} value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Dirección, aclaraciones..."
                maxLength={500} />
            </div>
          </div>

          <div style={modal.seccion}>
            <p style={modal.seccionTitulo}>🍬 Productos</p>
            <div style={modal.productosGrid}>
              {productos.map(p => (
                <div key={p.id} style={modal.productoItem}>
                  <div>
                    <p style={modal.productoNombre}>{p.nombre}</p>
                    <p style={modal.productoPrecio}>${Number(p.precio).toLocaleString('es-AR')}</p>
                  </div>
                  <button type="button" style={modal.btnAgregar} onClick={() => agregarProducto(p)}>+</button>
                </div>
              ))}
            </div>
          </div>

          {items.length > 0 && (
            <div style={modal.seccion}>
              <p style={modal.seccionTitulo}>📋 Resumen</p>
              {items.map(i => (
                <div key={i.id} style={modal.itemRow}>
                  <span style={{ flex: 1, fontSize: '0.9rem', color: '#e2e2ef' }}>{i.nombre}</span>
                  <div style={modal.cantControles}>
                    <button type="button" style={modal.btnCant} onClick={() => cambiarCantidad(i.id, i.cantidad - 1)}>−</button>
                    <span style={{ minWidth: '20px', textAlign: 'center', color: '#f1f1f3' }}>{i.cantidad}</span>
                    <button type="button" style={modal.btnCant} onClick={() => cambiarCantidad(i.id, i.cantidad + 1)}>+</button>
                  </div>
                  <span style={{ fontWeight: '700', color: '#a855f7', minWidth: '80px', textAlign: 'right' }}>
                    ${Number(i.precio * i.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
              <div style={modal.totalRow}>
                <span style={{ fontWeight: '700', color: '#f1f1f3' }}>Total</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#a855f7' }}>
                  ${Number(total).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          )}

          {error && <p style={modal.error}>{error}</p>}
          <div style={modal.acciones}>
            <button type="button" style={modal.btnSecundario} onClick={onCerrar}>Cancelar</button>
            <button type="submit" style={modal.btnPrimario} disabled={loading}>
              {loading ? 'Creando...' : '✅ Crear pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal Editar Pedido ─────────────────────────────────────────────
function ModalEditarPedido({ pedido, onCerrar, onGuardado }) {
  const [notas, setNotas] = useState(pedido.notas || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await editarPedido(pedido.id, { notas });
      onGuardado();
      onCerrar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al editar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modal.overlay}>
      <div style={{ ...modal.container, maxWidth: '480px' }}>
        <div style={modal.header}>
          <h3 style={modal.titulo}>✏️ Editar Pedido #{pedido.id}</h3>
          <button style={modal.btnCerrar} onClick={onCerrar}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={modal.body}>
          <div>
            <label style={modal.label}>Notas</label>
            <textarea
              style={{ ...modal.input, resize: 'vertical', minHeight: '80px' }}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Dirección, aclaraciones..."
              maxLength={500}
            />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>}
          <div style={modal.acciones}>
            <button type="button" style={modal.btnSecundario} onClick={onCerrar}>Cancelar</button>
            <button type="submit" style={modal.btnPrimario} disabled={loading}>
              {loading ? 'Guardando...' : '✅ Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página Principal ────────────────────────────────────────────────
export default function Pedidos() {
  const { toggle, isMobile } = useSidebar();
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [pedidoSel, setPedidoSel] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pedidoAEditar, setPedidoAEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const cargar = () => getPedidosAdmin().then(({ data }) => setPedidos(data));
  useEffect(() => { cargar(); }, []);

  useEffect(() => { setPagina(1); }, [busqueda, filtroEstado]);

  const verDetalle = async (pedido) => {
    const { data } = await getDetallePedido(pedido.id);
    setDetalle(data);
    setPedidoSel(pedido);
  };

  const handleEstado = async (id, estado) => {
    try {
      await cambiarEstado(id, estado);
      cargar();
      if (pedidoSel?.id === id) setPedidoSel({ ...pedidoSel, estado });
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const matchBusqueda = !busqueda ||
      p.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(p.id).includes(busqueda);
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const totalPaginas = Math.ceil(pedidosFiltrados.length / ITEMS_POR_PAGINA);
  const pedidosPaginados = pedidosFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  );

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={{ ...styles.main, marginLeft: isMobile ? 0 : '240px' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button style={styles.btnHamburger} onClick={toggle}>
                <Menu size={22} />
              </button>
            )}
            <h1 style={styles.title}>🛒 Pedidos</h1>
          </div>
          <button style={styles.btnPrimary} onClick={() => setMostrarModal(true)}>
            <Plus size={16} style={{ marginRight: '0.4rem' }} />
            Nuevo pedido
          </button>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} style={styles.filtros}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Buscar por cliente o N° pedido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div style={styles.filterWrapper}>
            <Filter size={15} style={{ color: '#8b8b9e', marginRight: '0.5rem', flexShrink: 0 }} />
            <select
              style={styles.filterSelect}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} style={styles.content}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPaginados.map((p) => {
                  const badge = estadoBadge[p.estado] || estadoBadge.pendiente;
                  return (
                    <tr key={p.id} style={styles.tr}
                      onMouseEnter={e => e.currentTarget.style.background = '#1e1e2e'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={styles.td}>
                        <span style={styles.pedidoId}>#{p.id}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.clienteNombre}>{p.nombreCliente}</span>
                      </td>
                      <td style={{ ...styles.td, color: '#8b8b9e' }}>{p.telefono}</td>
                      <td style={styles.td}>
                        <span style={styles.totalText}>${Number(p.total).toLocaleString('es-AR')}</span>
                      </td>
                      <td style={styles.td}>
                        <select
                          value={p.estado}
                          onChange={(e) => handleEstado(p.id, e.target.value)}
                          disabled={p.estado === 'cancelado'}
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            borderRadius: '8px',
                            padding: '0.25rem 0.6rem',
                            cursor: p.estado === 'cancelado' ? 'not-allowed' : 'pointer',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                          }}
                        >
                          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </td>
                      <td style={{ ...styles.td, color: '#8b8b9e' }}>
                        {new Date(p.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.acciones}>
                          <button style={styles.btnIcon} onClick={() => verDetalle(p)} title="Ver detalle">
                            <Eye size={15} />
                          </button>
                          {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                            <button style={styles.btnIcon} onClick={() => setPedidoAEditar(p)} title="Editar">
                              <Pencil size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pedidosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#8b8b9e' }}>
                      No se encontraron pedidos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div style={styles.pagination}>
                <button
                  style={{ ...styles.btnPag, opacity: pagina === 1 ? 0.4 : 1 }}
                  disabled={pagina === 1}
                  onClick={() => setPagina(p => p - 1)}
                >
                  ← Anterior
                </button>
                <span style={styles.paginaInfo}>Página {pagina} de {totalPaginas}</span>
                <button
                  style={{ ...styles.btnPag, opacity: pagina === totalPaginas ? 0.4 : 1 }}
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina(p => p + 1)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>

          {pedidoSel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={styles.detalle}
            >
              <div style={styles.detalleHeader}>
                <div>
                  <h3 style={styles.detalleTitulo}>Pedido #{pedidoSel.id}</h3>
                  <p style={styles.detalleCliente}>{pedidoSel.nombreCliente}</p>
                  <p style={{ color: '#8b8b9e', fontSize: '0.82rem' }}>{pedidoSel.telefono}</p>
                </div>
                <div>
                  {(() => {
                    const b = estadoBadge[pedidoSel.estado] || estadoBadge.pendiente;
                    return (
                      <span style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}`, borderRadius: '8px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: '700' }}>
                        {pedidoSel.estado}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ background: '#12121a' }}>
                    <th style={styles.th}>Producto</th>
                    <th style={styles.th}>Cant.</th>
                    <th style={styles.th}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle?.map((item, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{item.producto_nombre}</td>
                      <td style={{ ...styles.td, color: '#8b8b9e' }}>{item.cantidad}</td>
                      <td style={{ ...styles.td, color: '#a855f7', fontWeight: '700' }}>${item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={styles.detalleTotalRow}>
                <span style={{ fontWeight: '700', color: '#e2e2ef' }}>Total</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#a855f7' }}>
                  ${Number(pedidoSel.total).toLocaleString('es-AR')}
                </span>
              </div>
              <button style={styles.btnCerrar} onClick={() => { setDetalle(null); setPedidoSel(null); }}>
                Cerrar
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {mostrarModal && (
        <ModalNuevoPedido onCerrar={() => setMostrarModal(false)} onCreado={cargar} />
      )}
      {pedidoAEditar && (
        <ModalEditarPedido pedido={pedidoAEditar} onCerrar={() => setPedidoAEditar(null)} onGuardado={cargar} />
      )}
    </div>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: {
    padding: '2rem 2.5rem', flex: 1,
    background: '#0f0f13', minHeight: '100vh',
    fontFamily: "'Nunito', system-ui, sans-serif", color: '#f1f1f3',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '1.85rem', fontWeight: '900', color: '#f1f1f3', letterSpacing: '-0.03em', margin: 0 },
  btnPrimary: {
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white',
    border: 'none', padding: '0.65rem 1.4rem', borderRadius: '12px', cursor: 'pointer',
    fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(168,85,247,0.35)',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center',
  },
  btnHamburger: {
    background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f1f1f3',
    borderRadius: '10px', padding: '0.45rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  filtros: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  searchWrapper: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '12px',
    padding: '0.55rem 1rem', flex: 1, minWidth: '220px',
  },
  searchIcon: { color: '#8b8b9e', flexShrink: 0 },
  searchInput: {
    background: 'transparent', border: 'none', outline: 'none',
    color: '#f1f1f3', fontSize: '0.9rem', width: '100%', fontFamily: 'inherit',
  },
  filterWrapper: {
    display: 'flex', alignItems: 'center',
    background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '12px',
    padding: '0.55rem 1rem',
  },
  filterSelect: {
    background: 'transparent', border: 'none', outline: 'none',
    color: '#f1f1f3', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
  },
  content: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  tableWrapper: {
    flex: 1, background: '#1a1a24', borderRadius: '20px', overflow: 'hidden',
    border: '1px solid #2a2a3a',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: '700',
    color: '#8b8b9e', fontSize: '0.68rem', background: '#12121a',
    textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #2a2a3a',
  },
  tr: { borderBottom: '1px solid #2a2a3a', transition: 'background 0.15s' },
  td: { padding: '0.875rem 1.25rem', fontSize: '0.88rem', color: '#e2e2ef', fontWeight: '500' },
  pedidoId: { fontWeight: '800', color: '#a855f7' },
  clienteNombre: { fontWeight: '700', color: '#f1f1f3' },
  totalText: { fontWeight: '700', color: '#10b981' },
  acciones: { display: 'flex', gap: '0.5rem' },
  btnIcon: {
    background: '#12121a', border: '1px solid #2a2a3a', color: '#8b8b9e',
    borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.15s, border-color 0.15s',
  },
  detalle: {
    width: '320px', background: '#1a1a24', borderRadius: '20px',
    padding: '1.5rem', border: '1px solid #2a2a3a', flexShrink: 0,
  },
  detalleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  detalleTitulo: { fontSize: '1.1rem', fontWeight: '800', color: '#f1f1f3', margin: 0, marginBottom: '0.25rem' },
  detalleCliente: { color: '#e2e2ef', fontSize: '0.9rem', fontWeight: '600', margin: 0 },
  detalleTotalRow: {
    display: 'flex', justifyContent: 'space-between', paddingTop: '0.875rem',
    marginTop: '0.5rem', borderTop: '1px solid #2a2a3a',
  },
  btnCerrar: {
    marginTop: '1rem', background: '#12121a', border: '1px solid #2a2a3a',
    color: '#a855f7', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer',
    width: '100%', fontWeight: '700', fontFamily: 'inherit', fontSize: '0.875rem',
  },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '1rem', padding: '1.25rem',
  },
  paginaInfo: { color: '#8b8b9e', fontSize: '0.88rem', fontWeight: '600' },
  btnPag: {
    background: '#12121a', border: '1px solid #2a2a3a', color: '#a855f7',
    borderRadius: '10px', padding: '0.5rem 1.25rem', cursor: 'pointer',
    fontWeight: '700', fontSize: '0.88rem', fontFamily: 'inherit',
  },
};

const modal = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem',
  },
  container: {
    background: '#1a1a24', borderRadius: '20px', width: '100%', maxWidth: '680px',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    border: '1px solid #2a2a3a', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 1.5rem', borderBottom: '1px solid #2a2a3a',
  },
  titulo: { fontSize: '1.2rem', fontWeight: '700', color: '#f1f1f3' },
  btnCerrar: {
    background: '#12121a', border: '1px solid #2a2a3a', color: '#8b8b9e',
    borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: { overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  seccion: { background: '#12121a', borderRadius: '12px', padding: '1rem', border: '1px solid #2a2a3a' },
  seccionTitulo: { fontWeight: '700', color: '#e2e2ef', marginBottom: '0.75rem', fontSize: '0.95rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' },
  tab: {
    padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid #3a3a4a',
    background: '#1a1a24', cursor: 'pointer', fontSize: '0.85rem', color: '#8b8b9e', fontFamily: 'inherit',
  },
  tabActivo: { background: '#7c3aed', color: 'white', border: '1px solid #7c3aed', fontWeight: '600' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#8b8b9e', marginBottom: '0.25rem' },
  input: {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px',
    border: '1px solid #3a3a4a', fontSize: '0.9rem', boxSizing: 'border-box',
    background: '#1a1a24', color: '#f1f1f3', fontFamily: 'inherit', outline: 'none',
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: '#1a1a24', border: '1px solid #3a3a4a', borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 10,
  },
  dropdownItem: {
    padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.88rem',
    borderBottom: '1px solid #2a2a3a', color: '#e2e2ef',
  },
  productosGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' },
  productoItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1a1a24', borderRadius: '8px', padding: '0.6rem 0.8rem', border: '1px solid #2a2a3a',
  },
  productoNombre: { fontSize: '0.82rem', fontWeight: '600', color: '#e2e2ef', margin: 0 },
  productoPrecio: { fontSize: '0.78rem', color: '#a855f7', fontWeight: '600', margin: 0, marginTop: '2px' },
  btnAgregar: {
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white',
    border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer',
    fontSize: '1.1rem', fontWeight: '700',
  },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.5rem 0', borderBottom: '1px solid #2a2a3a',
  },
  cantControles: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  btnCant: {
    width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #3a3a4a',
    background: '#1a1a24', cursor: 'pointer', fontWeight: '700', color: '#e2e2ef', fontFamily: 'inherit',
  },
  totalRow: { display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.25rem' },
  error: { color: '#f87171', fontSize: '0.875rem', textAlign: 'center' },
  acciones: { display: 'flex', gap: '0.75rem' },
  btnSecundario: {
    flex: 1, padding: '0.75rem', background: '#12121a', border: '1px solid #2a2a3a',
    borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#8b8b9e', fontFamily: 'inherit',
  },
  btnPrimario: {
    flex: 2, padding: '0.75rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '700', fontSize: '1rem', fontFamily: 'inherit',
  },
};
