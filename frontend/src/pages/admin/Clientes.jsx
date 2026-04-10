import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, ChevronDown, ChevronUp, X, Menu } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import { useSidebar } from '../../context/SidebarContext';
import { getClientes, getPerfilCliente, editarCliente, crearCliente } from '../../api/clientesApi';

const ITEMS_POR_PAGINA = 20;
const emptyForm = { nombre: '', telefono: '', direccion: '', email: '' };

const estadoColor = {
  pendiente:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b'  },
  confirmado: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981'  },
  entregado:  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa'  },
  cancelado:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171'  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: 'easeOut' },
  }),
};

function getInitial(nombre) {
  return nombre ? nombre.trim()[0].toUpperCase() : '?';
}

const avatarColors = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];
function avatarColor(nombre) {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash += nombre.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
}

// ── Modal Crear/Editar Cliente ──────────────────────────────────────
function ModalCliente({ cliente, onCerrar, onGuardado }) {
  const [form, setForm] = useState(
    cliente
      ? { nombre: cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion || '', email: cliente.email || '' }
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={modal.container}
      >
        <div style={modal.header}>
          <h3 style={modal.titulo}>{cliente ? '✏️ Editar Cliente' : '👤 Nuevo Cliente'}</h3>
          <button style={modal.btnCerrar} onClick={onCerrar}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={modal.body}>
          <div>
            <label style={modal.label}>Nombre *</label>
            <input style={modal.input} value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre completo" required maxLength={100} />
          </div>
          <div>
            <label style={modal.label}>Teléfono / WhatsApp *</label>
            <input style={modal.input} value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej: 5491155556666" required maxLength={20} />
          </div>
          <div>
            <label style={modal.label}>Dirección</label>
            <input style={modal.input} value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Ej: Av. Corrientes 1234, CABA" maxLength={200} />
          </div>
          <div>
            <label style={modal.label}>Email</label>
            <input style={modal.input} type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ej: cliente@email.com" maxLength={150} />
          </div>
          {error && <p style={modal.error}>{error}</p>}
          <div style={modal.acciones}>
            <button type="button" style={modal.btnSecundario} onClick={onCerrar}>Cancelar</button>
            <button type="submit" style={modal.btnPrimario} disabled={loading}>
              {loading ? 'Guardando...' : '✅ Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Fila expandible con historial ───────────────────────────────────
function FilaCliente({ c, onEditar }) {
  const [expandido, setExpandido] = useState(false);
  const [historial, setHistorial] = useState(null);
  const [cargando, setCargando] = useState(false);

  const toggleExpand = async () => {
    if (!expandido && !historial) {
      setCargando(true);
      try {
        const { data } = await getPerfilCliente(c.id);
        setHistorial(data);
      } finally {
        setCargando(false);
      }
    }
    setExpandido(!expandido);
  };

  const color = avatarColor(c.nombre);

  return (
    <>
      <tr style={styles.tr}
        onMouseEnter={e => e.currentTarget.style.background = '#1e1e2e'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <td style={styles.td}>
          <div style={styles.clienteInfo}>
            <div style={{ ...styles.avatar, background: color }}>
              {getInitial(c.nombre)}
            </div>
            <div>
              <div style={styles.clienteNombre}>{c.nombre}</div>
              {c.email && <div style={styles.clienteDir}>{c.email}</div>}
              {c.direccion && <div style={styles.clienteDir}>{c.direccion}</div>}
            </div>
          </div>
        </td>
        <td style={{ ...styles.td, color: '#8b8b9e' }}>{c.telefono}</td>
        <td style={styles.td}>
          <span style={styles.pedidosBadge}>{c.cantidad_pedidos}</span>
        </td>
        <td style={styles.td}>
          <span style={styles.totalGastado}>${Number(c.total_gastado).toLocaleString('es-AR')}</span>
        </td>
        <td style={{ ...styles.td, color: '#8b8b9e', fontSize: '0.82rem' }}>
          {c.ultimo_pedido
            ? new Date(c.ultimo_pedido).toLocaleDateString('es-AR')
            : <span style={{ color: '#3a3a4a' }}>—</span>}
        </td>
        <td style={styles.td}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={styles.btnIcon} onClick={toggleExpand} title="Ver historial">
              {expandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            <button style={styles.btnIconEdit} onClick={() => onEditar(c)} title="Editar">
              <Pencil size={15} />
            </button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expandido && (
          <tr>
            <td colSpan={6} style={{ padding: 0, background: '#12121a', borderBottom: '1px solid #2a2a3a' }}>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ padding: '1rem 1.5rem' }}
              >
                <p style={styles.historialTitulo}>Historial de pedidos</p>
                {cargando ? (
                  <p style={{ color: '#8b8b9e', fontSize: '0.88rem' }}>Cargando...</p>
                ) : historial?.length === 0 ? (
                  <p style={{ color: '#8b8b9e', fontSize: '0.88rem' }}>Sin pedidos aún</p>
                ) : (
                  <div style={styles.historialGrid}>
                    {historial?.map((p) => {
                      const est = estadoColor[p.estado] || { bg: '#2a2a3a', color: '#8b8b9e' };
                      return (
                        <div key={p.id} style={styles.pedidoCard}>
                          <div style={styles.pedidoCardTop}>
                            <span style={styles.pedidoId}>#{p.id}</span>
                            <span style={{
                              ...styles.estadoBadge,
                              background: est.bg,
                              color: est.color,
                            }}>{p.estado}</span>
                          </div>
                          <span style={styles.pedidoTotal}>${Number(p.total).toLocaleString('es-AR')}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Página Principal ────────────────────────────────────────────────
export default function Clientes() {
  const { toggle, isMobile } = useSidebar();
  const [clientes, setClientes] = useState([]);
  const [modalCliente, setModalCliente] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const cargar = () => getClientes().then(({ data }) => setClientes(data));
  useEffect(() => { cargar(); }, []);

  useEffect(() => { setPagina(1); }, [busqueda]);

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda)
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / ITEMS_POR_PAGINA);
  const clientesPaginados = clientesFiltrados.slice(
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
            <h1 style={styles.title}>👥 Clientes</h1>
          </div>
          <button style={styles.btnPrimary} onClick={() => setModalCliente('nuevo')}>
            <Plus size={16} style={{ marginRight: '0.4rem' }} />
            Nuevo cliente
          </button>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} style={styles.searchRow}>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <span style={styles.totalLabel}>
            {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''}
          </span>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} style={styles.tableWrapper}>
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
              {clientesPaginados.map((c) => (
                <FilaCliente
                  key={c.id}
                  c={c}
                  onEditar={(cliente) => setModalCliente(cliente)}
                />
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#8b8b9e' }}>
                    No se encontraron clientes
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
        </motion.div>
      </main>

      {modalCliente && (
        <ModalCliente
          cliente={modalCliente === 'nuevo' ? null : modalCliente}
          onCerrar={() => setModalCliente(null)}
          onGuardado={() => { cargar(); setModalCliente(null); }}
        />
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
  searchRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  searchWrapper: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '12px',
    padding: '0.55rem 1rem', flex: 1, maxWidth: '400px',
  },
  searchIcon: { color: '#8b8b9e', flexShrink: 0 },
  searchInput: {
    background: 'transparent', border: 'none', outline: 'none',
    color: '#f1f1f3', fontSize: '0.9rem', width: '100%', fontFamily: 'inherit',
  },
  totalLabel: { color: '#8b8b9e', fontSize: '0.85rem', fontWeight: '600' },
  tableWrapper: {
    background: '#1a1a24', borderRadius: '20px', overflow: 'hidden', border: '1px solid #2a2a3a',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: '700',
    color: '#8b8b9e', fontSize: '0.68rem', background: '#12121a',
    textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #2a2a3a',
  },
  tr: { borderBottom: '1px solid #2a2a3a', transition: 'background 0.15s' },
  td: { padding: '0.875rem 1.25rem', fontSize: '0.88rem', color: '#e2e2ef', fontWeight: '500' },
  clienteInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontWeight: '800',
    fontSize: '0.9rem', color: 'white', flexShrink: 0,
  },
  clienteNombre: { fontWeight: '700', color: '#f1f1f3', fontSize: '0.9rem' },
  clienteDir: { fontSize: '0.75rem', color: '#8b8b9e', marginTop: '1px' },
  pedidosBadge: {
    background: 'rgba(168,85,247,0.15)', color: '#a855f7',
    border: '1px solid rgba(168,85,247,0.3)',
    padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800',
  },
  totalGastado: { fontWeight: '700', color: '#10b981' },
  btnIcon: {
    background: '#12121a', border: '1px solid #2a2a3a', color: '#8b8b9e',
    borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  btnIconEdit: {
    background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
    color: '#a855f7', borderRadius: '8px', width: '32px', height: '32px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  historialTitulo: {
    fontSize: '0.72rem', fontWeight: '800', color: '#8b8b9e', textTransform: 'uppercase',
    letterSpacing: '0.1em', marginBottom: '0.75rem',
  },
  historialGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  pedidoCard: {
    background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: '10px',
    padding: '0.5rem 0.75rem', minWidth: '140px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
  },
  pedidoCardTop: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  pedidoId: { fontSize: '0.82rem', fontWeight: '700', color: '#a855f7' },
  estadoBadge: {
    fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '8px', fontWeight: '700',
  },
  pedidoTotal: { fontSize: '0.85rem', fontWeight: '800', color: '#10b981' },
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
    background: '#1a1a24', borderRadius: '20px', width: '100%', maxWidth: '440px',
    border: '1px solid #2a2a3a', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 1.5rem', borderBottom: '1px solid #2a2a3a',
  },
  titulo: { fontSize: '1.1rem', fontWeight: '700', color: '#f1f1f3' },
  btnCerrar: {
    background: '#12121a', border: '1px solid #2a2a3a', color: '#8b8b9e',
    borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: {
    display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#8b8b9e',
    marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  input: {
    width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px',
    border: '1px solid #3a3a4a', fontSize: '0.9rem', boxSizing: 'border-box',
    background: '#12121a', color: '#f1f1f3', fontFamily: 'inherit', outline: 'none',
  },
  error: { color: '#f87171', fontSize: '0.875rem', textAlign: 'center' },
  acciones: { display: 'flex', gap: '0.75rem', marginTop: '0.25rem' },
  btnSecundario: {
    flex: 1, padding: '0.75rem', background: '#12121a', border: '1px solid #2a2a3a',
    borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#8b8b9e', fontFamily: 'inherit',
  },
  btnPrimario: {
    flex: 2, padding: '0.75rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '700', fontSize: '0.95rem', fontFamily: 'inherit',
  },
};
