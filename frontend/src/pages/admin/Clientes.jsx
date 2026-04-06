import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { getClientes, getPerfilCliente, editarCliente, crearCliente } from '../../api/clientesApi';

const emptyForm = { nombre: '', telefono: '', direccion: '' };

// ── Modal Crear/Editar Cliente ──────────────────────────────────────
function ModalCliente({ cliente, onCerrar, onGuardado }) {
  const [form, setForm] = useState(
    cliente
      ? { nombre: cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion || '' }
      : emptyForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (cliente) {
        await editarCliente(cliente.id, form);
      } else {
        await crearCliente(form);
      }
      onGuardado();
      onCerrar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modal.overlay}>
      <div style={modal.container}>
        <div style={modal.header}>
          <h3 style={modal.titulo}>{cliente ? '✏️ Editar Cliente' : '👤 Nuevo Cliente'}</h3>
          <button style={modal.btnCerrar} onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={modal.body}>
          <div>
            <label style={modal.label}>Nombre *</label>
            <input style={modal.input} value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre completo" required />
          </div>
          <div>
            <label style={modal.label}>Teléfono / WhatsApp *</label>
            <input style={modal.input} value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej: 5491155556666" required />
          </div>
          <div>
            <label style={modal.label}>Dirección</label>
            <input style={modal.input} value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Ej: Av. Corrientes 1234, CABA" />
          </div>
          {error && <p style={modal.error}>{error}</p>}
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
export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [clienteSel, setClienteSel] = useState(null);
  const [modalCliente, setModalCliente] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = () => getClientes().then(({ data }) => setClientes(data));
  useEffect(() => { cargar(); }, []);

  const verPerfil = async (cliente) => {
    const { data } = await getPerfilCliente(cliente.id);
    setPerfil(data);
    setClienteSel(cliente);
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda)
  );

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>👥 Clientes</h1>
          <button style={styles.btnPrimary} onClick={() => setModalCliente('nuevo')}>
            + Nuevo cliente
          </button>
        </div>

        <div style={styles.buscadorWrapper}>
          <input
            style={styles.buscador}
            placeholder="🔍 Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div style={styles.content}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Pedidos</th>
                  <th style={styles.th}>Total gastado</th>
                  <th style={styles.th}>Último pedido</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}><span style={styles.nombre}>{c.nombre}</span></td>
                    <td style={styles.td}>{c.telefono}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{c.cantidad_pedidos}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.totalGastado}>${Number(c.total_gastado).toLocaleString('es-AR')}</span>
                    </td>
                    <td style={styles.td}>
                      {c.ultimo_pedido
                        ? new Date(c.ultimo_pedido).toLocaleDateString('es-AR')
                        : <span style={{ color: '#9ca3af' }}>—</span>}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.btnSmall} onClick={() => verPerfil(c)} title="Ver historial">🔍</button>
                      <button style={styles.btnSmall} onClick={() => setModalCliente(c)} title="Editar">✏️</button>
                    </td>
                  </tr>
                ))}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No se encontraron clientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {clienteSel && (
            <div style={styles.detalle}>
              <div style={styles.detalleHeader}>
                <div>
                  <h3 style={styles.detalleNombre}>{clienteSel.nombre}</h3>
                  <p style={styles.detalleTel}>📞 {clienteSel.telefono}</p>
                  {clienteSel.direccion && <p style={styles.detalleTel}>📍 {clienteSel.direccion}</p>}
                </div>
                <button style={styles.btnEditarPerfil} onClick={() => setModalCliente(clienteSel)}>✏️</button>
              </div>
              <div style={styles.statsRow}>
                <div style={styles.statItem}>
                  <p style={styles.statNum}>{clienteSel.cantidad_pedidos}</p>
                  <p style={styles.statLabel}>Pedidos</p>
                </div>
                <div style={styles.statItem}>
                  <p style={styles.statNum}>${Number(clienteSel.total_gastado).toLocaleString('es-AR')}</p>
                  <p style={styles.statLabel}>Total gastado</p>
                </div>
              </div>
              <h4 style={styles.historialTitulo}>Historial</h4>
              {perfil?.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Sin pedidos aún</p>
              ) : (
                <div style={styles.historial}>
                  {perfil?.map((p) => (
                    <div key={p.id} style={styles.pedidoRow}>
                      <div>
                        <span style={styles.pedidoId}>#{p.id}</span>
                        <span style={{ ...styles.estadoBadge, background: estadoColor[p.estado] }}>{p.estado}</span>
                      </div>
                      <span style={styles.pedidoTotal}>${Number(p.total).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
              )}
              <button style={styles.btnCerrar} onClick={() => { setPerfil(null); setClienteSel(null); }}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      </main>

      {modalCliente && (
        <ModalCliente
          cliente={modalCliente === 'nuevo' ? null : modalCliente}
          onCerrar={() => setModalCliente(null)}
          onGuardado={() => {
            cargar();
            if (clienteSel && modalCliente?.id === clienteSel.id) {
              setClienteSel(null);
              setPerfil(null);
            }
          }}
        />
      )}
    </div>
  );
}

const estadoColor = { pendiente: '#f59e0b', confirmado: '#3b82f6', entregado: '#10b981', cancelado: '#ef4444' };

const styles = {
  layout: { display: 'flex' },
  main: { marginLeft: '240px', padding: '2rem', flex: 1, background: '#f3f4f6', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.75rem', color: '#1f2937' },
  btnPrimary: { background: '#7c3aed', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  buscadorWrapper: { marginBottom: '1.25rem' },
  buscador: { padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', width: '320px', background: 'white' },
  content: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  tableWrapper: { flex: 1, background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.85rem', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#374151' },
  nombre: { fontWeight: '600', color: '#1f2937' },
  badge: { background: '#ede9fe', color: '#7c3aed', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' },
  totalGastado: { fontWeight: '600', color: '#10b981' },
  btnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginRight: '0.25rem' },
  detalle: { width: '300px', background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flexShrink: 0 },
  detalleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  detalleNombre: { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' },
  detalleTel: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.2rem' },
  btnEditarPerfil: { background: '#ede9fe', border: 'none', borderRadius: '7px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '1rem' },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', background: '#f9fafb', borderRadius: '8px', padding: '0.75rem' },
  statItem: { flex: 1, textAlign: 'center' },
  statNum: { fontWeight: '800', fontSize: '1.1rem', color: '#7c3aed' },
  statLabel: { fontSize: '0.75rem', color: '#6b7280' },
  historialTitulo: { fontSize: '0.9rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' },
  historial: { display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' },
  pedidoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '7px' },
  pedidoId: { fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginRight: '0.5rem' },
  estadoBadge: { fontSize: '0.72rem', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '600' },
  pedidoTotal: { fontSize: '0.88rem', fontWeight: '700', color: '#10b981' },
  btnCerrar: { marginTop: '1rem', background: '#e5e7eb', border: 'none', padding: '0.5rem 1rem', borderRadius: '7px', cursor: 'pointer', width: '100%' },
};

const modal = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' },
  container: { background: 'white', borderRadius: '14px', width: '100%', maxWidth: '440px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' },
  titulo: { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' },
  btnCerrar: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  body: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' },
  input: { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', boxSizing: 'border-box' },
  error: { color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' },
  acciones: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  btnSecundario: { flex: 1, padding: '0.75rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  btnPrimario: { flex: 2, padding: '0.75rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
};