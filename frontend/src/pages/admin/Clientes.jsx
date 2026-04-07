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
  main: { marginLeft: '240px', padding: '2rem 2.5rem', flex: 1, background: '#f5f4ff', minHeight: '100vh', fontFamily: "'Nunito', system-ui, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '1.85rem', fontWeight: '900', color: '#1e1333', letterSpacing: '-0.03em', margin: 0 },
  btnPrimary: { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', fontFamily: 'inherit' },
  buscadorWrapper: { marginBottom: '1.5rem' },
  buscador: { padding: '0.65rem 1.1rem', borderRadius: '12px', border: '1px solid #ede9fe', fontSize: '0.9rem', width: '320px', background: 'white', outline: 'none', fontFamily: 'inherit', boxShadow: '0 1px 4px rgba(109,40,217,0.06)' },
  content: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  tableWrapper: { flex: 1, background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #ede9fe', boxShadow: '0 1px 6px rgba(109,40,217,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: '700', color: '#9ca3af', fontSize: '0.68rem', background: '#faf9ff', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #ede9fe' },
  tr: { borderBottom: '1px solid #f5f3ff' },
  td: { padding: '0.875rem 1.25rem', fontSize: '0.88rem', color: '#1e1333', fontWeight: '500' },
  nombre: { fontWeight: '700', color: '#1e1333' },
  badge: { background: '#ede9fe', color: '#7c3aed', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' },
  totalGastado: { fontWeight: '700', color: '#10b981' },
  btnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginRight: '0.25rem' },
  detalle: { width: '300px', background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #ede9fe', boxShadow: '0 1px 6px rgba(109,40,217,0.06)', flexShrink: 0 },
  detalleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  detalleNombre: { fontSize: '1.1rem', fontWeight: '800', color: '#1e1333', letterSpacing: '-0.01em' },
  detalleTel: { fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.2rem', fontWeight: '500' },
  btnEditarPerfil: { background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '10px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '1rem' },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.25rem', background: '#faf9ff', borderRadius: '14px', padding: '0.875rem', border: '1px solid #f3f0ff' },
  statItem: { flex: 1, textAlign: 'center' },
  statNum: { fontWeight: '900', fontSize: '1.15rem', color: '#7c3aed', letterSpacing: '-0.02em', margin: 0 },
  statLabel: { fontSize: '0.68rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' },
  historialTitulo: { fontSize: '0.8rem', fontWeight: '800', color: '#1e1333', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
  historial: { display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' },
  pedidoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: '#faf9ff', borderRadius: '10px', border: '1px solid #f3f0ff' },
  pedidoId: { fontSize: '0.82rem', fontWeight: '700', color: '#1e1333', marginRight: '0.5rem' },
  estadoBadge: { fontSize: '0.68rem', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' },
  pedidoTotal: { fontSize: '0.85rem', fontWeight: '800', color: '#10b981' },
  btnCerrar: { marginTop: '1rem', background: '#f5f3ff', border: '1px solid #ede9fe', color: '#7c3aed', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '700', fontFamily: 'inherit', fontSize: '0.875rem' },
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