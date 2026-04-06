import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getPedidosAdmin, getDetallePedido, cambiarEstado, editarPedido } from '../../api/pedidosApi';
import { registrarPedido } from '../../api/pedidosApi';
import { getProductosAdmin } from '../../api/productosApi';
import { getClientes } from '../../api/clientesApi';

const ESTADOS = ['pendiente', 'confirmado', 'entregado', 'cancelado'];
const colorEstado = { pendiente: '#f59e0b', confirmado: '#3b82f6', entregado: '#10b981', cancelado: '#ef4444' };

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
      c.nombre.toLowerCase().includes(texto.toLowerCase()) ||
      c.telefono.includes(texto)
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
          <button style={modal.btnCerrar} onClick={onCerrar}>✕</button>
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
                  value={busqueda} onChange={(e) => buscarCliente(e.target.value)} />
                {clientesFiltrados.length > 0 && (
                  <div style={modal.dropdown}>
                    {clientesFiltrados.map(c => (
                      <div key={c.id} style={modal.dropdownItem} onClick={() => seleccionarCliente(c)}>
                        <strong>{c.nombre}</strong> — {c.telefono}
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
                  placeholder="Nombre del cliente" required />
              </div>
              <div>
                <label style={modal.label}>Teléfono *</label>
                <input style={modal.input} value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="Ej: 5491155556666" required />
              </div>
            </div>
            <div>
              <label style={modal.label}>Notas</label>
              <input style={modal.input} value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Dirección, aclaraciones..." />
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
                  <span style={{ flex: 1, fontSize: '0.9rem' }}>{i.nombre}</span>
                  <div style={modal.cantControles}>
                    <button type="button" style={modal.btnCant} onClick={() => cambiarCantidad(i.id, i.cantidad - 1)}>−</button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{i.cantidad}</span>
                    <button type="button" style={modal.btnCant} onClick={() => cambiarCantidad(i.id, i.cantidad + 1)}>+</button>
                  </div>
                  <span style={{ fontWeight: '700', color: '#7c3aed', minWidth: '80px', textAlign: 'right' }}>
                    ${Number(i.precio * i.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
              <div style={modal.totalRow}>
                <span style={{ fontWeight: '700' }}>Total</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#7c3aed' }}>
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
  const [form, setForm] = useState({
    nombre_cliente: pedido.nombreCliente,
    telefono: pedido.telefono,
    notas: pedido.notas || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await editarPedido(pedido.id, form);
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
          <button style={modal.btnCerrar} onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={modal.body}>
          <div>
            <label style={modal.label}>Nombre cliente *</label>
            <input style={modal.input} value={form.nombre_cliente}
              onChange={(e) => setForm({ ...form, nombre_cliente: e.target.value })}
              required />
          </div>
          <div>
            <label style={modal.label}>Teléfono *</label>
            <input style={modal.input} value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              required />
          </div>
          <div>
            <label style={modal.label}>Notas</label>
            <textarea
              style={{ ...modal.input, resize: 'vertical', minHeight: '80px' }}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Dirección, aclaraciones..."
            />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
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
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [pedidoSel, setPedidoSel] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pedidoAEditar, setPedidoAEditar] = useState(null);

  const cargar = () => getPedidosAdmin().then(({ data }) => setPedidos(data));
  useEffect(() => { cargar(); }, []);

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

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛒 Pedidos</h1>
          <button style={styles.btnPrimary} onClick={() => setMostrarModal(true)}>
            + Nuevo pedido
          </button>
        </div>

        <div style={styles.content}>
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
                {pedidos.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>#{p.id}</td>
                    <td style={styles.td}>{p.nombreCliente}</td>
                    <td style={styles.td}>{p.telefono}</td>
                    <td style={styles.td}>${p.total}</td>
                    <td style={styles.td}>
                      <select
                        value={p.estado}
                        onChange={(e) => handleEstado(p.id, e.target.value)}
                        disabled={p.estado === 'cancelado'}
                        style={{
                          background: colorEstado[p.estado],
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.3rem 0.5rem',
                          cursor: p.estado === 'cancelado' ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          opacity: p.estado === 'cancelado' ? 0.7 : 1
                        }}
                      >
                        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td style={styles.td}>{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                    <td style={styles.td}>
                      <button style={styles.btnSmall} onClick={() => verDetalle(p)} title="Ver detalle">🔍</button>
                      {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                        <button style={styles.btnSmall} onClick={() => setPedidoAEditar(p)} title="Editar">✏️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pedidoSel && (
            <div style={styles.detalle}>
              <h3>Pedido #{pedidoSel.id}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {pedidoSel.nombreCliente} · {pedidoSel.telefono}
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={styles.th}>Producto</th>
                    <th style={styles.th}>Cant.</th>
                    <th style={styles.th}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle?.map((item, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{item.producto_nombre}</td>
                      <td style={styles.td}>{item.cantidad}</td>
                      <td style={styles.td}>${item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '1rem', textAlign: 'right', color: '#7c3aed' }}>
                Total: ${pedidoSel.total}
              </p>
              <button style={styles.btnCerrar} onClick={() => { setDetalle(null); setPedidoSel(null); }}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      </main>

      {mostrarModal && (
        <ModalNuevoPedido
          onCerrar={() => setMostrarModal(false)}
          onCreado={cargar}
        />
      )}

      {pedidoAEditar && (
        <ModalEditarPedido
          pedido={pedidoAEditar}
          onCerrar={() => setPedidoAEditar(null)}
          onGuardado={cargar}
        />
      )}
    </div>
  );
}

const styles = {
  layout: { display: 'flex' },
  main: { marginLeft: '240px', padding: '2rem', flex: 1, background: '#f3f4f6', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', color: '#1f2937' },
  btnPrimary: { background: '#7c3aed', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' },
  content: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  tableWrapper: { flex: 1, background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.85rem', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  detalle: { width: '320px', background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  btnCerrar: { marginTop: '1rem', background: '#e5e7eb', border: 'none', padding: '0.5rem 1rem', borderRadius: '7px', cursor: 'pointer', width: '100%' },
};

const modal = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' },
  container: { background: 'white', borderRadius: '14px', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' },
  titulo: { fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' },
  btnCerrar: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  body: { overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  seccion: { background: '#f9fafb', borderRadius: '10px', padding: '1rem' },
  seccionTitulo: { fontWeight: '700', color: '#374151', marginBottom: '0.75rem', fontSize: '0.95rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' },
  tab: { padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '0.85rem', color: '#374151' },
  tabActivo: { background: '#7c3aed', color: 'white', border: '1px solid #7c3aed', fontWeight: '600' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' },
  input: { width: '100%', padding: '0.55rem 0.8rem', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box', background: 'white' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 },
  dropdownItem: { padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.88rem', borderBottom: '1px solid #f3f4f6' },
  productosGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' },
  productoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: '8px', padding: '0.6rem 0.8rem', border: '1px solid #e5e7eb' },
  productoNombre: { fontSize: '0.82rem', fontWeight: '600', color: '#1f2937' },
  productoPrecio: { fontSize: '0.78rem', color: '#7c3aed', fontWeight: '600' },
  btnAgregar: { background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '700' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' },
  cantControles: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  btnCant: { width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontWeight: '700' },
  totalRow: { display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.25rem' },
  error: { color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' },
  acciones: { display: 'flex', gap: '0.75rem' },
  btnSecundario: { flex: 1, padding: '0.75rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnPrimario: { flex: 2, padding: '0.75rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },
};